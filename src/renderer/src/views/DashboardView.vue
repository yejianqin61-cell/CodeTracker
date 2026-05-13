<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { getHeatmap, getSummary, type SummaryDto, type HeatmapItem } from '@/api/stats'
import { listLogs, createLog, type LogItemDto } from '@/api/logs'
import { listProjects, type ProjectDto } from '@/api/projects'
import { ApiRequestError } from '@/api/http'
import { heatmapYearBoundsUtc, todayUtcYmd, utcCalendarYear } from '@/lib/dates'
import { buildGithubStyleColumns, intensityClass } from '@/lib/heatmapGrid'
import { useI18n } from '@/i18n'

const { t, localeTag } = useI18n()

const loading = ref(true)
const errMsg = ref('')
const summary = ref<SummaryDto | null>(null)
const miniItems = ref<HeatmapItem[]>([])
const recentLogs = ref<LogItemDto[]>([])
const projects = ref<ProjectDto[]>([])

const quickBusy = ref(false)
const quick = ref({
  project_id: 0,
  code_lines: 100,
  duration_minutes: 60,
  note: '',
})

const miniColumns = computed(() => {
  const { from, to } = heatmapYearBoundsUtc(utcCalendarYear())
  return buildGithubStyleColumns(from, to, miniItems.value)
})

const greeting = computed(() => {
  const h = new Date().getHours()
  if (h < 5) {
    return { title: t('greeting.night.title'), sub: t('greeting.night.sub') }
  }
  if (h < 12) {
    return { title: t('greeting.morning.title'), sub: t('greeting.morning.sub') }
  }
  if (h < 17) {
    return { title: t('greeting.afternoon.title'), sub: t('greeting.afternoon.sub') }
  }
  return { title: t('greeting.evening.title'), sub: t('greeting.evening.sub') }
})

function fmtNum(n: number): string {
  const tag = localeTag()
  return Number.isFinite(n) ? n.toLocaleString(tag) : '—'
}

async function loadRecent() {
  const r = await listLogs({ page: 1, page_size: 6 })
  recentLogs.value = r.items
}

async function loadProjects() {
  const r = await listProjects()
  projects.value = r.items
  if (quick.value.project_id === 0 && r.items.length > 0) {
    quick.value.project_id = r.items[0].id
  }
}

async function load() {
  loading.value = true
  errMsg.value = ''
  try {
    const { from, to } = heatmapYearBoundsUtc(utcCalendarYear())
    const [s, h] = await Promise.all([getSummary(), getHeatmap({ from, to })])
    summary.value = s
    miniItems.value = h.items
    await Promise.all([loadRecent(), loadProjects()])
  } catch (e) {
    errMsg.value = e instanceof ApiRequestError ? e.apiMessage() : String(e)
    summary.value = null
    miniItems.value = []
    recentLogs.value = []
  } finally {
    loading.value = false
  }
}

async function submitQuick() {
  if (!projects.value.length) {
    errMsg.value = t('dash.quick.needProject')
    return
  }
  quickBusy.value = true
  errMsg.value = ''
  try {
    await createLog({
      date: todayUtcYmd(),
      project_id: Number(quick.value.project_id),
      code_lines: Number(quick.value.code_lines),
      duration_minutes: Number(quick.value.duration_minutes),
      note: quick.value.note.trim() || '',
    })
    quick.value.note = ''
    await load()
  } catch (e) {
    errMsg.value = e instanceof ApiRequestError ? e.apiMessage() : String(e)
  } finally {
    quickBusy.value = false
  }
}

function previewNote(s: string, max = 72) {
  const x = s.trim()
  if (!x) return '—'
  return x.length > max ? `${x.slice(0, max)}…` : x
}

function cellTitleDash(cell: { dateStr: string; inRange: boolean; code_lines: number; duration_minutes: number }) {
  if (!cell.inRange) return cell.dateStr
  return `${cell.dateStr} · ${cell.code_lines} ${t('dash.recent.lines')} · ${cell.duration_minutes} ${t('dash.recent.min')}`
}

onMounted(() => {
  void load()
})
</script>

<template>
  <div class="space-y-10">
    <!-- Greeting -->
    <div class="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h1 class="text-3xl font-bold tracking-tight text-white sm:text-4xl">
          {{ greeting.title }}
          <span
            class="inline-block origin-[70%_70%] animate-[ct-hand-wave_2.2s_ease-in-out_infinite]"
            aria-hidden="true"
          >👋</span>
        </h1>
        <p class="mt-2 max-w-xl text-[15px] leading-relaxed text-slate-400">
          {{ greeting.sub }}
        </p>
      </div>
      <button
        type="button"
        class="group inline-flex shrink-0 items-center gap-2 self-start rounded-xl border border-white/[0.08] bg-white/[0.04] px-4 py-2.5 text-sm font-medium text-slate-200 shadow-lg shadow-black/20 backdrop-blur-sm transition hover:border-cyan-400/25 hover:bg-white/[0.07] hover:text-white disabled:opacity-40"
        :disabled="loading"
        @click="load"
      >
        <svg
          class="h-4 w-4 text-cyan-400/80 transition group-hover:rotate-180"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
        >
          <path d="M21 12a9 9 0 1 1-3-6.7" />
          <path d="M21 3v7h-7" />
        </svg>
        {{ t('common.refresh') }}
      </button>
    </div>

    <div
      v-if="errMsg"
      class="rounded-2xl border border-amber-500/25 bg-amber-500/[0.08] px-4 py-3 text-sm text-amber-100 shadow-[0_0_24px_-8px_rgba(245,158,11,0.25)] backdrop-blur-md"
    >
      {{ errMsg }}
    </div>

    <!-- Stats -->
    <div class="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <article
        class="group relative overflow-hidden rounded-2xl border border-white/[0.08] bg-gradient-to-br from-white/[0.06] to-transparent p-5 shadow-xl shadow-black/20 transition duration-300 hover:-translate-y-0.5 hover:border-cyan-400/20 hover:shadow-[0_0_40px_-12px_rgba(34,211,238,0.25)]"
      >
        <div
          class="pointer-events-none absolute -right-6 -top-6 h-28 w-28 rounded-full bg-cyan-500/20 blur-2xl transition group-hover:bg-cyan-400/30"
        />
        <div class="relative flex items-start justify-between">
          <div>
            <p class="text-[11px] font-semibold uppercase tracking-wider text-slate-500">{{ t('dash.stat.today') }}</p>
            <p class="mt-1 text-sm font-medium text-slate-300">{{ t('dash.stat.codeLines') }}</p>
          </div>
          <div
            class="flex h-10 w-10 items-center justify-center rounded-xl border border-cyan-400/20 bg-cyan-500/10 text-cyan-300"
          >
            <svg class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75">
              <path d="M16 18 22 12 16 6M8 6 2 12l6 6" />
            </svg>
          </div>
        </div>
        <p class="relative mt-4 font-mono text-3xl font-bold tracking-tight text-white tabular-nums">
          {{ loading ? '…' : fmtNum(summary?.today_code_lines ?? 0) }}
        </p>
      </article>

      <article
        class="group relative overflow-hidden rounded-2xl border border-white/[0.08] bg-gradient-to-br from-white/[0.06] to-transparent p-5 shadow-xl shadow-black/20 transition duration-300 hover:-translate-y-0.5 hover:border-violet-400/25 hover:shadow-[0_0_40px_-12px_rgba(167,139,250,0.3)]"
      >
        <div
          class="pointer-events-none absolute -right-6 -top-6 h-28 w-28 rounded-full bg-violet-500/20 blur-2xl transition group-hover:bg-violet-400/30"
        />
        <div class="relative flex items-start justify-between">
          <div>
            <p class="text-[11px] font-semibold uppercase tracking-wider text-slate-500">{{ t('dash.stat.today') }}</p>
            <p class="mt-1 text-sm font-medium text-slate-300">{{ t('dash.stat.codingTime') }}</p>
          </div>
          <div
            class="flex h-10 w-10 items-center justify-center rounded-xl border border-violet-400/20 bg-violet-500/10 text-violet-200"
          >
            <svg class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75">
              <circle cx="12" cy="12" r="9" />
              <path d="M12 7v6l4 2" />
            </svg>
          </div>
        </div>
        <p class="relative mt-4 font-mono text-3xl font-bold tracking-tight text-white tabular-nums">
          {{ loading ? '…' : fmtNum(summary?.today_duration_minutes ?? 0) }}
        </p>
        <p class="relative mt-1 text-xs text-slate-500">{{ t('dash.stat.minutesTracked') }}</p>
      </article>

      <article
        class="group relative overflow-hidden rounded-2xl border border-white/[0.08] bg-gradient-to-br from-white/[0.06] to-transparent p-5 shadow-xl shadow-black/20 transition duration-300 hover:-translate-y-0.5 hover:border-emerald-400/25 hover:shadow-[0_0_40px_-12px_rgba(52,211,153,0.28)]"
      >
        <div
          class="pointer-events-none absolute -right-6 -top-6 h-28 w-28 rounded-full bg-emerald-500/20 blur-2xl transition group-hover:bg-emerald-400/25"
        />
        <div class="relative flex items-start justify-between">
          <div>
            <p class="text-[11px] font-semibold uppercase tracking-wider text-slate-500">{{ t('dash.stat.allTime') }}</p>
            <p class="mt-1 text-sm font-medium text-slate-300">{{ t('dash.stat.totalLines') }}</p>
          </div>
          <div
            class="flex h-10 w-10 items-center justify-center rounded-xl border border-emerald-400/20 bg-emerald-500/10 text-emerald-200"
          >
            <svg class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75">
              <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
              <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
            </svg>
          </div>
        </div>
        <p class="relative mt-4 font-mono text-3xl font-bold tracking-tight text-white tabular-nums">
          {{ loading ? '…' : fmtNum(summary?.total_code_lines ?? 0) }}
        </p>
      </article>

      <article
        class="group relative overflow-hidden rounded-2xl border border-white/[0.08] bg-gradient-to-br from-fuchsia-500/[0.08] via-transparent to-cyan-500/[0.06] p-5 shadow-xl shadow-black/20 transition duration-300 hover:-translate-y-0.5 hover:border-fuchsia-400/30 hover:shadow-[0_0_40px_-12px_rgba(217,70,239,0.25)]"
      >
        <div
          class="pointer-events-none absolute -right-8 top-0 h-32 w-32 rounded-full bg-fuchsia-500/15 blur-3xl"
        />
        <div class="relative flex items-start justify-between">
          <div>
            <p class="text-[11px] font-semibold uppercase tracking-wider text-slate-500">{{ t('dash.stat.streak') }}</p>
            <p class="mt-1 text-sm font-medium text-slate-300">{{ t('dash.stat.activeDays') }}</p>
          </div>
          <div
            class="flex h-10 w-10 items-center justify-center rounded-xl border border-fuchsia-400/25 bg-fuchsia-500/10 text-fuchsia-200"
          >
            <svg class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75">
              <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1-1-2-2-3s-2-3-2-4a6 6 0 0 1 12 0c0 1-1 2-2 3s-2 2-2 3a2.5 2.5 0 0 0 2.5 2.5z" />
            </svg>
          </div>
        </div>
        <p class="relative mt-4 font-mono text-3xl font-bold tracking-tight text-white tabular-nums">
          {{ loading ? '…' : fmtNum(summary?.streak_days ?? 0) }}
        </p>
        <p class="relative mt-1 text-xs text-slate-500">{{ t('dash.stat.streakHint') }}</p>
      </article>
    </div>

    <!-- Heatmap -->
    <section
      class="overflow-hidden rounded-2xl border border-white/[0.08] bg-[#0a0f1c]/60 p-6 shadow-2xl shadow-black/30 backdrop-blur-xl"
    >
      <div class="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 class="text-lg font-semibold tracking-tight text-white">{{ t('dash.heatmap.title') }}</h2>
          <p class="mt-1 text-sm text-slate-500">{{ t('dash.heatmap.sub') }}</p>
        </div>
        <div class="flex items-center gap-2 text-[11px] text-slate-500">
          <span class="h-2 w-2 rounded-full bg-violet-500/40" />
          {{ t('common.less') }}
          <span class="mx-1 inline-flex gap-0.5">
            <span class="h-2.5 w-2.5 rounded-sm border border-cyan-400/25 bg-cyan-500/25" />
            <span class="h-2.5 w-2.5 rounded-sm border border-emerald-400/30 bg-emerald-400/40" />
            <span class="h-2.5 w-2.5 rounded-sm border border-emerald-300/40 bg-emerald-300/55" />
            <span class="h-2.5 w-2.5 rounded-sm border border-white/20 bg-gradient-to-br from-cyan-300/60 to-violet-400/40" />
          </span>
          {{ t('common.more') }}
        </div>
      </div>
      <div class="mt-6 overflow-x-auto pb-2">
        <div class="flex min-w-max gap-1">
          <div
            class="mr-2 flex shrink-0 flex-col justify-between py-1 pr-1 text-[10px] font-medium uppercase tracking-wide text-slate-600"
          >
            <span>{{ t('common.sun') }}</span>
            <span>{{ t('common.sat') }}</span>
          </div>
          <div v-for="(col, ci) in miniColumns" :key="ci" class="flex shrink-0 flex-col gap-1">
            <div
              v-for="(cell, ri) in col"
              :key="ri"
              class="h-3.5 w-3.5 rounded-md transition duration-150 hover:z-10 hover:scale-125 hover:ring-2 hover:ring-cyan-400/40"
              :class="intensityClass(cell.intensity, cell.inRange)"
              :title="cellTitleDash(cell)"
            />
          </div>
        </div>
      </div>
    </section>

    <div class="grid gap-8 lg:grid-cols-5">
      <!-- Recent logs -->
      <section class="lg:col-span-3">
        <div class="mb-4 flex items-center justify-between">
          <h2 class="text-lg font-semibold tracking-tight text-white">{{ t('dash.recent.title') }}</h2>
          <RouterLink
            to="/logs"
            class="text-xs font-medium text-cyan-400/90 hover:text-cyan-300"
          >
            {{ t('dash.recent.viewAll') }}
          </RouterLink>
        </div>
        <div class="space-y-3">
          <div
            v-if="loading"
            class="rounded-2xl border border-white/[0.06] bg-white/[0.02] px-4 py-10 text-center text-sm text-slate-500"
          >
            {{ t('dash.recent.loading') }}
          </div>
          <div
            v-else-if="!recentLogs.length"
            class="rounded-2xl border border-dashed border-white/[0.1] bg-white/[0.02] px-4 py-10 text-center text-sm text-slate-500"
          >
            {{ t('dash.recent.empty') }}
          </div>
          <template v-else>
            <article
              v-for="(log, idx) in recentLogs"
              :key="log.id"
              class="group relative flex gap-4 rounded-2xl border border-white/[0.06] bg-gradient-to-r from-white/[0.04] to-transparent px-4 py-3.5 transition hover:border-white/[0.12] hover:from-white/[0.07]"
            >
            <div class="flex w-8 shrink-0 flex-col items-center pt-0.5">
              <div
                class="h-2.5 w-2.5 rounded-full bg-gradient-to-br from-cyan-400 to-violet-500 shadow-[0_0_10px_rgba(34,211,238,0.45)]"
              />
              <div
                v-if="idx < recentLogs.length - 1"
                class="mt-1 min-h-[2rem] w-px flex-1 bg-gradient-to-b from-white/15 to-transparent"
              />
            </div>
            <div class="min-w-0 flex-1">
              <div class="flex flex-wrap items-baseline gap-2">
                <span
                  class="rounded-lg border border-violet-400/20 bg-violet-500/10 px-2 py-0.5 text-[11px] font-semibold text-violet-200"
                >
                  {{ log.project_name ?? `${t('dash.recent.projectHash')}${log.project_id}` }}
                </span>
                <span class="text-[11px] text-slate-500">{{ log.date }}</span>
              </div>
              <div class="mt-2 flex flex-wrap gap-3 text-xs text-slate-400">
                <span class="font-mono text-cyan-300/90">+{{ fmtNum(log.code_lines) }} {{ t('dash.recent.lines') }}</span>
                <span class="text-slate-500">·</span>
                <span>{{ log.duration_minutes }} {{ t('dash.recent.min') }}</span>
              </div>
              <p class="mt-1.5 line-clamp-2 text-sm leading-snug text-slate-400">
                {{ previewNote(log.note) }}
              </p>
            </div>
          </article>
          </template>
        </div>
      </section>

      <!-- Quick log -->
      <section class="lg:col-span-2">
        <h2 class="mb-4 text-lg font-semibold tracking-tight text-white">{{ t('dash.quick.title') }}</h2>
        <div
          class="sticky top-4 rounded-2xl border border-white/[0.1] bg-gradient-to-b from-white/[0.07] to-white/[0.02] p-5 shadow-[0_0_48px_-16px_rgba(99,102,241,0.35)] backdrop-blur-xl"
        >
          <p class="text-xs leading-relaxed text-slate-400">
            {{ t('dash.quick.hint') }}
          </p>
          <div class="mt-5 space-y-4">
            <label class="block">
              <span class="mb-1.5 block text-[11px] font-semibold uppercase tracking-wider text-slate-500">{{ t('dash.quick.project') }}</span>
              <select
                v-model.number="quick.project_id"
                class="w-full rounded-xl border border-white/[0.1] bg-[#070b14]/80 px-3 py-2.5 text-sm text-white outline-none ring-cyan-400/30 transition focus:border-cyan-400/40 focus:ring-2"
              >
                <option v-for="p in projects" :key="p.id" :value="p.id">{{ p.name }}</option>
              </select>
            </label>
            <div class="grid grid-cols-2 gap-3">
              <label class="block">
                <span class="mb-1.5 block text-[11px] font-semibold uppercase tracking-wider text-slate-500">{{ t('dash.quick.lines') }}</span>
                <input
                  v-model.number="quick.code_lines"
                  type="number"
                  min="0"
                  class="w-full rounded-xl border border-white/[0.1] bg-[#070b14]/80 px-3 py-2.5 font-mono text-sm text-white outline-none focus:border-cyan-400/40 focus:ring-2 focus:ring-cyan-400/20"
                />
              </label>
              <label class="block">
                <span class="mb-1.5 block text-[11px] font-semibold uppercase tracking-wider text-slate-500">{{ t('dash.quick.minutes') }}</span>
                <input
                  v-model.number="quick.duration_minutes"
                  type="number"
                  min="0"
                  class="w-full rounded-xl border border-white/[0.1] bg-[#070b14]/80 px-3 py-2.5 font-mono text-sm text-white outline-none focus:border-cyan-400/40 focus:ring-2 focus:ring-cyan-400/20"
                />
              </label>
            </div>
            <label class="block">
              <span class="mb-1.5 block text-[11px] font-semibold uppercase tracking-wider text-slate-500">{{ t('dash.quick.notes') }}</span>
              <textarea
                v-model="quick.note"
                rows="3"
                :placeholder="t('dash.quick.placeholder')"
                class="w-full resize-none rounded-xl border border-white/[0.1] bg-[#070b14]/80 px-3 py-2.5 text-sm text-white placeholder:text-slate-600 outline-none focus:border-violet-400/40 focus:ring-2 focus:ring-violet-400/20"
              />
            </label>
            <button
              type="button"
              class="relative w-full overflow-hidden rounded-xl bg-gradient-to-r from-violet-600 via-fuchsia-600 to-cyan-500 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-violet-500/25 transition hover:brightness-110 active:scale-[0.99] disabled:opacity-40"
              :disabled="quickBusy || !projects.length"
              @click="submitQuick"
            >
              <span class="relative z-10">{{ quickBusy ? t('dash.quick.saving') : t('dash.quick.submit') }}</span>
              <span
                class="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"
              />
            </button>
            <RouterLink
              v-if="!projects.length"
              to="/logs"
              class="block text-center text-xs text-cyan-400/90 hover:text-cyan-300"
            >
              {{ t('dash.quick.gotoLogs') }}
            </RouterLink>
          </div>
        </div>
      </section>
    </div>
  </div>
</template>
