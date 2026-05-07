<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()

const nav = computed(() => [
  { to: '/dashboard', label: '首页' },
  { to: '/logs', label: '日志' },
  { to: '/heatmap', label: '热力图' },
  { to: '/statistics', label: '统计' },
  { to: '/settings', label: '设置' },
])

function isActive(to: string) {
  return route.path === to
}
</script>

<template>
  <div class="h-screen w-screen overflow-hidden bg-slate-950 text-slate-100">
    <div class="flex h-full">
      <aside class="w-60 shrink-0 border-r border-slate-800/80 bg-slate-950/50 p-3">
        <div class="px-2 py-2 text-sm font-semibold tracking-wide text-slate-200">
          CodeTracker
        </div>

        <nav class="mt-2 space-y-1">
          <RouterLink
            v-for="item in nav"
            :key="item.to"
            :to="item.to"
            class="block rounded-md px-3 py-2 text-sm transition"
            :class="
              isActive(item.to)
                ? 'bg-slate-800/60 text-slate-50'
                : 'text-slate-300 hover:bg-slate-900/60 hover:text-slate-50'
            "
          >
            {{ item.label }}
          </RouterLink>
        </nav>
      </aside>

      <main class="min-w-0 flex-1">
        <header class="flex h-12 items-center border-b border-slate-800/80 px-5">
          <div class="text-sm text-slate-300">本地离线 · Express API</div>
        </header>

        <section class="h-[calc(100%-3rem)] overflow-auto p-5">
          <RouterView />
        </section>
      </main>
    </div>
  </div>
</template>

