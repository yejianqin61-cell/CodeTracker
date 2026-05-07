<script setup lang="ts"></script>

<template>
  <div class="space-y-4">
    <div class="text-lg font-semibold">Dashboard</div>

    <div class="grid grid-cols-2 gap-3 xl:grid-cols-4">
      <div class="rounded-lg border border-slate-800/80 bg-slate-950/40 p-4">
        <div class="text-xs text-slate-400">今日代码量</div>
        <div class="mt-2 text-2xl font-semibold">—</div>
      </div>
      <div class="rounded-lg border border-slate-800/80 bg-slate-950/40 p-4">
        <div class="text-xs text-slate-400">今日开发时长</div>
        <div class="mt-2 text-2xl font-semibold">—</div>
      </div>
      <div class="rounded-lg border border-slate-800/80 bg-slate-950/40 p-4">
        <div class="text-xs text-slate-400">总代码量</div>
        <div class="mt-2 text-2xl font-semibold">—</div>
      </div>
      <div class="rounded-lg border border-slate-800/80 bg-slate-950/40 p-4">
        <div class="text-xs text-slate-400">连续开发天数</div>
        <div class="mt-2 text-2xl font-semibold">—</div>
      </div>
    </div>

    <div class="rounded-lg border border-slate-800/80 bg-slate-950/40 p-4">
      <div class="text-sm text-slate-200">热力图（占位）</div>
      <div class="mt-3 h-32 rounded-md bg-slate-900/50"></div>
    </div>
  </div>
</template>

