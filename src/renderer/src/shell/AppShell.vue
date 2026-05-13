<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { useI18n } from '@/i18n'

const route = useRoute()
const { t } = useI18n()

const nav = computed(() => [
  {
    to: '/dashboard',
    label: t('nav.dashboard'),
    sub: t('nav.dashboardSub'),
    icon: 'dashboard',
  },
  { to: '/logs', label: t('nav.logs'), sub: t('nav.logsSub'), icon: 'logs' },
  { to: '/heatmap', label: t('nav.heatmap'), sub: t('nav.heatmapSub'), icon: 'heatmap' },
  { to: '/statistics', label: t('nav.stats'), sub: t('nav.statsSub'), icon: 'stats' },
  { to: '/settings', label: t('nav.settings'), sub: t('nav.settingsSub'), icon: 'settings' },
])

function isActive(to: string) {
  return route.path === to
}
</script>

<template>
  <!-- w-screen(100vw) 在部分系统上会大于「可视宽度」，配合 overflow-hidden 会把右侧主区裁掉；用 w-full + min-w-0 占满父级即可 -->
  <div class="flex h-full min-h-0 w-full min-w-0 overflow-hidden font-sans text-slate-100">
    <!-- Ambient orbs -->
    <div
      class="pointer-events-none fixed inset-0 overflow-hidden opacity-90"
      aria-hidden="true"
    >
      <div
        class="absolute -left-32 top-1/4 h-96 w-96 rounded-full bg-violet-600/20 blur-[100px]"
      />
      <div
        class="absolute -right-20 bottom-1/4 h-80 w-80 rounded-full bg-cyan-500/15 blur-[90px]"
      />
      <div
        class="absolute left-1/2 top-0 h-64 w-[28rem] -translate-x-1/2 rounded-full bg-emerald-500/10 blur-[80px]"
      />
    </div>

    <aside
      class="relative z-10 flex w-[17rem] shrink-0 flex-col border-r border-white/[0.06] bg-[#080c18]/75 px-4 py-6 backdrop-blur-2xl"
    >
      <RouterLink
        to="/dashboard"
        class="group mb-10 flex items-center gap-3 rounded-2xl px-2 py-1 transition hover:bg-white/[0.04]"
      >
        <div
          class="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500 via-fuchsia-500 to-cyan-400 p-[1px] shadow-lg shadow-violet-500/25"
        >
          <div
            class="flex h-full w-full items-center justify-center rounded-[0.9rem] bg-[#0a0e1a] text-sm font-bold tracking-tight text-white"
          >
            CT
          </div>
        </div>
        <div class="min-w-0">
          <div class="truncate text-[15px] font-semibold tracking-tight text-white">CodeTracker</div>
          <div class="truncate text-[11px] font-medium text-slate-500">{{ t('shell.tagline') }}</div>
        </div>
      </RouterLink>

      <nav class="flex flex-1 flex-col gap-1">
        <RouterLink
          v-for="item in nav"
          :key="item.to + item.label"
          :to="item.to"
          class="group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-[13px] font-medium transition-all duration-200"
          :class="
            isActive(item.to)
              ? 'bg-white/[0.08] text-white shadow-[0_0_24px_-8px_rgba(167,139,250,0.45)] ring-1 ring-white/[0.12]'
              : 'text-slate-400 hover:bg-white/[0.04] hover:text-slate-200'
          "
        >
          <span
            v-if="isActive(item.to)"
            class="absolute inset-y-2 left-0 w-1 rounded-full bg-gradient-to-b from-cyan-400 to-violet-500 opacity-90"
            aria-hidden="true"
          />
          <span
            class="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border transition-colors"
            :class="
              isActive(item.to)
                ? 'border-cyan-400/25 bg-cyan-500/10 text-cyan-300'
                : 'border-white/[0.06] bg-white/[0.03] text-slate-500 group-hover:border-white/10 group-hover:text-slate-300'
            "
          >
            <svg
              v-if="item.icon === 'dashboard'"
              class="h-[18px] w-[18px]"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="1.75"
            >
              <rect x="3" y="3" width="7" height="9" rx="1.5" />
              <rect x="14" y="3" width="7" height="5" rx="1.5" />
              <rect x="14" y="11" width="7" height="10" rx="1.5" />
              <rect x="3" y="15" width="7" height="6" rx="1.5" />
            </svg>
            <svg
              v-else-if="item.icon === 'logs'"
              class="h-[18px] w-[18px]"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="1.75"
            >
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6z" />
              <path d="M14 2v6h6M16 13H8M16 17H8M10 9H8" />
            </svg>
            <svg
              v-else-if="item.icon === 'heatmap'"
              class="h-[18px] w-[18px]"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="1.75"
            >
              <rect x="3" y="3" width="5" height="5" rx="1" />
              <rect x="10" y="3" width="5" height="5" rx="1" />
              <rect x="17" y="3" width="4" height="5" rx="1" />
              <rect x="3" y="10" width="5" height="5" rx="1" />
              <rect x="10" y="10" width="5" height="5" rx="1" />
              <rect x="17" y="10" width="4" height="5" rx="1" />
              <rect x="3" y="17" width="5" height="4" rx="1" />
              <rect x="10" y="17" width="5" height="4" rx="1" />
              <rect x="17" y="17" width="4" height="4" rx="1" />
            </svg>
            <svg
              v-else-if="item.icon === 'stats'"
              class="h-[18px] w-[18px]"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="1.75"
            >
              <path d="M18 20V10M12 20V4M6 20v-6" />
            </svg>
            <svg
              v-else
              class="h-[18px] w-[18px]"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="1.75"
            >
              <circle cx="12" cy="12" r="3" />
              <path d="M12 2v2m0 16v2M4.93 4.93l1.41 1.41m11.32 11.32l1.41 1.41M2 12h2m16 0h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
            </svg>
          </span>
          <div class="min-w-0 flex-1">
            <div class="truncate leading-tight">{{ item.label }}</div>
            <div class="truncate text-[11px] font-normal text-slate-500 group-hover:text-slate-500">
              {{ item.sub }}
            </div>
          </div>
        </RouterLink>
      </nav>

      <div
        class="mt-auto rounded-xl border border-white/[0.06] bg-gradient-to-br from-white/[0.05] to-transparent px-3 py-3"
      >
        <div class="text-[11px] font-medium uppercase tracking-wider text-slate-500">{{ t('shell.session') }}</div>
        <div class="mt-1 flex items-center gap-2 text-xs text-slate-400">
          <span class="relative flex h-2 w-2">
            <span
              class="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400/60 opacity-40"
            />
            <span class="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
          </span>
          {{ t('shell.sessionStatus') }}
        </div>
      </div>
    </aside>

    <main class="relative z-10 flex min-w-0 flex-1 flex-col">
      <header
        class="flex h-14 shrink-0 items-center justify-end border-b border-white/[0.06] bg-[#070a12]/40 px-8 backdrop-blur-xl"
      >
        <div class="text-xs font-medium text-slate-500">{{ t('shell.mvpBadge') }}</div>
      </header>

      <section class="min-h-0 flex-1 overflow-y-auto overflow-x-hidden">
        <div class="mx-auto max-w-6xl px-8 py-10 pb-16">
          <RouterView />
        </div>
      </section>
    </main>
  </div>
</template>
