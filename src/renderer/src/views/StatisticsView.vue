<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { getHeatmap, getSummary, type SummaryDto } from '@/api/stats'
import { ApiRequestError } from '@/api/http'
import { shiftYmd, todayUtcYmd } from '@/lib/dates'
import { useI18n } from '@/i18n'

const { t, localeTag } = useI18n()

const loading = ref(false)
const errMsg = ref('')
const summary = ref<SummaryDto | null>(null)

const sum7 = ref({ lines: 0, minutes: 0 })
const sum30 = ref({ lines: 0, minutes: 0 })

function sumRange(items: { code_lines: number; duration_minutes: number }[]) {
  return items.reduce(
    (acc, it) => {
      acc.lines += Number(it.code_lines) || 0
      acc.minutes += Number(it.duration_minutes) || 0
      return acc
    },
    { lines: 0, minutes: 0 },
  )
}

const cards = computed(() => [
  { title: t('stats.card7'), sub: t('stats.cardSub'), ...sum7.value },
  { title: t('stats.card30'), sub: t('stats.cardSub'), ...sum30.value },
])

function fmtInt(n: number) {
  return n.toLocaleString(localeTag())
}

async function load() {
  loading.value = true
  errMsg.value = ''
  try {
    const tday = todayUtcYmd()
    const [s, h7, h30] = await Promise.all([
      getSummary(),
      getHeatmap({ from: shiftYmd(tday, 6), to: tday }),
      getHeatmap({ from: shiftYmd(tday, 29), to: tday }),
    ])
    summary.value = s
    sum7.value = sumRange(h7.items)
    sum30.value = sumRange(h30.items)
  } catch (e) {
    errMsg.value = e instanceof ApiRequestError ? e.apiMessage() : String(e)
    summary.value = null
    sum7.value = { lines: 0, minutes: 0 }
    sum30.value = { lines: 0, minutes: 0 }
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  void load()
})
</script>

<template>
  <div class="space-y-8">
    <div class="flex items-end justify-between gap-4">
      <div>
        <h1 class="text-3xl font-bold tracking-tight text-white">{{ t('stats.title') }}</h1>
        <p class="mt-1 text-sm text-slate-500">{{ t('stats.sub') }}</p>
      </div>
      <button
        type="button"
        class="rounded-xl border border-white/[0.1] bg-white/[0.04] px-4 py-2 text-sm font-medium text-slate-200 transition hover:bg-white/[0.08] disabled:opacity-40"
        :disabled="loading"
        @click="load"
      >
        {{ t('common.refresh') }}
      </button>
    </div>

    <div
      v-if="errMsg"
      class="rounded-2xl border border-amber-500/25 bg-amber-500/[0.08] px-4 py-3 text-sm text-amber-100"
    >
      {{ errMsg }}
    </div>

    <section
      class="rounded-2xl border border-white/[0.08] bg-[#0a0f1c]/60 p-6 backdrop-blur-xl"
    >
      <div class="text-sm font-medium text-slate-300">
        {{ t('stats.globalLead') }}
        <code class="rounded bg-white/[0.06] px-1.5 py-0.5 text-xs text-cyan-300/90">GET /api/summary</code>
      </div>
      <div v-if="loading" class="mt-4 text-sm text-slate-500">{{ t('common.loading') }}</div>
      <dl v-else-if="summary" class="mt-4 grid grid-cols-2 gap-4 text-sm md:grid-cols-4">
        <div class="rounded-xl border border-white/[0.06] bg-white/[0.03] p-3">
          <dt class="text-[11px] font-semibold uppercase tracking-wider text-slate-500">{{ t('stats.totalLines') }}</dt>
          <dd class="mt-2 font-mono text-xl font-bold text-white">{{ fmtInt(summary.total_code_lines) }}</dd>
        </div>
        <div class="rounded-xl border border-white/[0.06] bg-white/[0.03] p-3">
          <dt class="text-[11px] font-semibold uppercase tracking-wider text-slate-500">{{ t('stats.totalMinutes') }}</dt>
          <dd class="mt-2 font-mono text-xl font-bold text-white">{{ fmtInt(summary.total_duration_minutes) }}</dd>
        </div>
        <div class="rounded-xl border border-white/[0.06] bg-white/[0.03] p-3">
          <dt class="text-[11px] font-semibold uppercase tracking-wider text-slate-500">{{ t('stats.todayLines') }}</dt>
          <dd class="mt-2 font-mono text-xl font-bold text-cyan-200">{{ fmtInt(summary.today_code_lines) }}</dd>
        </div>
        <div class="rounded-xl border border-white/[0.06] bg-white/[0.03] p-3">
          <dt class="text-[11px] font-semibold uppercase tracking-wider text-slate-500">{{ t('stats.streak') }}</dt>
          <dd class="mt-2 font-mono text-xl font-bold text-violet-200">{{ fmtInt(summary.streak_days) }}</dd>
        </div>
      </dl>
    </section>

    <div class="grid grid-cols-1 gap-4 xl:grid-cols-2">
      <div
        v-for="c in cards"
        :key="c.title"
        class="rounded-2xl border border-white/[0.08] bg-gradient-to-br from-white/[0.05] to-transparent p-5 shadow-xl shadow-black/20"
      >
        <div class="text-base font-semibold text-white">{{ c.title }}</div>
        <div class="mt-1 text-xs text-slate-500">{{ c.sub }}</div>
        <div class="mt-5 grid grid-cols-2 gap-4">
          <div>
            <div class="text-[11px] font-medium uppercase tracking-wider text-slate-500">{{ t('stats.linesSum') }}</div>
            <div class="mt-1 font-mono text-2xl font-bold text-emerald-200">{{ fmtInt(c.lines) }}</div>
          </div>
          <div>
            <div class="text-[11px] font-medium uppercase tracking-wider text-slate-500">{{ t('stats.minutesSum') }}</div>
            <div class="mt-1 font-mono text-2xl font-bold text-cyan-200/90">{{ fmtInt(c.minutes) }}</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
