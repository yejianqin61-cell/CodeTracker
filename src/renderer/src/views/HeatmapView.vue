<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { getHeatmap, type HeatmapItem } from '@/api/stats'
import { ApiRequestError } from '@/api/http'
import { HEATMAP_FIRST_YEAR, heatmapYearBoundsUtc, utcCalendarYear } from '@/lib/dates'
import { buildGithubStyleColumns, intensityClass, type HeatmapCell } from '@/lib/heatmapGrid'
import { useI18n } from '@/i18n'

const { t } = useI18n()

const loading = ref(false)
const errMsg = ref('')
const selectedYear = ref(Math.max(HEATMAP_FIRST_YEAR, utcCalendarYear()))
const items = ref<HeatmapItem[]>([])

const yearOptions = computed(() => {
  const end = Math.max(HEATMAP_FIRST_YEAR, utcCalendarYear())
  const list: number[] = []
  for (let y = HEATMAP_FIRST_YEAR; y <= end; y++) list.push(y)
  return list
})

const bounds = computed(() => heatmapYearBoundsUtc(selectedYear.value))

const columns = computed(() =>
  buildGithubStyleColumns(bounds.value.from, bounds.value.to, items.value),
)

function cellTitle(cell: HeatmapCell) {
  if (!cell.inRange) return cell.dateStr
  return `${cell.dateStr} · ${cell.code_lines} ${t('dash.recent.lines')} · ${cell.duration_minutes} ${t('dash.recent.min')} · L${cell.intensity}`
}

async function fetchHeat() {
  loading.value = true
  errMsg.value = ''
  const { from, to } = heatmapYearBoundsUtc(selectedYear.value)
  try {
    const h = await getHeatmap({ from, to })
    items.value = h.items
  } catch (e) {
    errMsg.value = e instanceof ApiRequestError ? e.apiMessage() : String(e)
    items.value = []
  } finally {
    loading.value = false
  }
}

watch(selectedYear, () => {
  void fetchHeat()
}, { immediate: true })
</script>

<template>
  <div class="space-y-8">
    <div>
      <h1 class="text-3xl font-bold tracking-tight text-white">{{ t('heatmap.title') }}</h1>
      <p class="mt-2 text-sm text-slate-500">{{ t('heatmap.sub') }}</p>
    </div>

    <div
      class="flex flex-wrap items-end gap-4 rounded-2xl border border-white/[0.08] bg-[#0a0f1c]/55 p-5 backdrop-blur-xl"
    >
      <label class="flex flex-col gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
        {{ t('heatmap.year') }}
        <select
          v-model.number="selectedYear"
          class="min-w-[8rem] rounded-xl border border-white/[0.1] bg-[#070b14]/90 px-3 py-2 text-sm text-white outline-none focus:border-cyan-400/40 focus:ring-2 focus:ring-cyan-400/15"
        >
          <option v-for="y in yearOptions" :key="y" :value="y">{{ y }}</option>
        </select>
      </label>
      <p class="pb-2 text-sm text-slate-400">
        {{ t('heatmap.yearRange', { from: bounds.from, to: bounds.to }) }}
      </p>
    </div>

    <div
      v-if="errMsg"
      class="rounded-2xl border border-amber-500/25 bg-amber-500/[0.08] px-4 py-3 text-sm text-amber-100"
    >
      {{ errMsg }}
    </div>

    <section
      class="overflow-hidden rounded-2xl border border-white/[0.08] bg-[#0a0f1c]/60 p-6 shadow-2xl shadow-black/30 backdrop-blur-xl"
    >
      <p class="text-sm text-slate-400">{{ t('heatmap.hint') }}</p>
      <div class="mt-5 overflow-x-auto pb-2">
        <div class="flex min-w-max gap-1">
          <div
            class="mr-2 flex shrink-0 flex-col justify-between gap-1 py-0.5 pr-1 text-[10px] font-medium uppercase tracking-wide text-slate-600"
          >
            <span>{{ t('heatmap.daySun') }}</span>
            <span>{{ t('heatmap.dayMon') }}</span>
            <span>{{ t('heatmap.dayTue') }}</span>
            <span>{{ t('heatmap.dayWed') }}</span>
            <span>{{ t('heatmap.dayThu') }}</span>
            <span>{{ t('heatmap.dayFri') }}</span>
            <span>{{ t('heatmap.daySat') }}</span>
          </div>
          <div v-for="(col, ci) in columns" :key="ci" class="flex shrink-0 flex-col gap-1">
            <div
              v-for="(cell, ri) in col"
              :key="ri"
              class="h-3.5 w-3.5 rounded-md transition duration-150 hover:z-10 hover:scale-125 hover:ring-2 hover:ring-cyan-400/40"
              :class="intensityClass(cell.intensity, cell.inRange)"
              :title="cellTitle(cell)"
            />
          </div>
        </div>
      </div>
    </section>
  </div>
</template>
