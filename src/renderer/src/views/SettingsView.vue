<script setup lang="ts">
import { ref } from 'vue'
import { getBaseUrl } from '@/api/http'
import { getHealth } from '@/api/health'
import { ApiRequestError } from '@/api/http'
import { useI18n } from '@/i18n'

const { t, locale } = useI18n()

const repoUrl = 'https://github.com/yejianqin61-cell/CodeTracker'

const base = getBaseUrl()
const checking = ref(false)
const healthText = ref('')
const errMsg = ref('')

async function ping() {
  checking.value = true
  healthText.value = ''
  errMsg.value = ''
  try {
    const h = await getHealth()
    healthText.value = JSON.stringify(h, null, 2)
  } catch (e) {
    errMsg.value = e instanceof ApiRequestError ? e.apiMessage() : String(e)
  } finally {
    checking.value = false
  }
}
</script>

<template>
  <div class="space-y-8">
    <div>
      <h1 class="text-3xl font-bold tracking-tight text-white">{{ t('settings.title') }}</h1>
      <p class="mt-2 text-sm text-slate-500">{{ t('settings.sub') }}</p>
    </div>

    <div
      class="rounded-2xl border border-white/[0.08] bg-[#0a0f1c]/60 p-6 text-sm shadow-2xl shadow-black/25 backdrop-blur-xl"
    >
      <div class="text-xs font-semibold uppercase tracking-wider text-slate-500">{{ t('settings.language') }}</div>
      <p class="mt-2 text-xs text-slate-500">{{ t('settings.languageHint') }}</p>
      <select
        v-model="locale"
        class="mt-4 w-full max-w-xs rounded-xl border border-white/[0.1] bg-[#070b14]/90 px-3 py-2.5 text-sm text-white outline-none focus:border-violet-400/40 focus:ring-2 focus:ring-violet-400/15"
      >
        <option value="zh">{{ t('settings.langZh') }}</option>
        <option value="en">{{ t('settings.langEn') }}</option>
      </select>
    </div>

    <div
      class="rounded-2xl border border-white/[0.08] bg-[#0a0f1c]/60 p-6 text-sm shadow-2xl shadow-black/25 backdrop-blur-xl"
    >
      <div class="text-xs font-semibold uppercase tracking-wider text-slate-500">{{ t('settings.apiBase') }}</div>
      <div
        class="mt-3 break-all rounded-xl border border-cyan-500/20 bg-[#070b14]/90 px-4 py-3 font-mono text-xs text-cyan-200/90"
      >
        {{ base }}
      </div>
      <p class="mt-3 text-xs leading-relaxed text-slate-500">
        {{ t('settings.apiHint') }}
      </p>
      <button
        type="button"
        class="mt-5 rounded-xl bg-gradient-to-r from-violet-600 to-cyan-500 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-violet-500/20 transition hover:brightness-110 disabled:opacity-50"
        :disabled="checking"
        @click="ping"
      >
        {{ t('settings.ping') }}
      </button>
      <div
        v-if="errMsg"
        class="mt-4 rounded-xl border border-rose-500/30 bg-rose-500/[0.08] px-3 py-2 text-xs text-rose-100"
      >
        {{ errMsg }}
      </div>
      <pre
        v-if="healthText"
        class="mt-4 max-h-52 overflow-auto rounded-xl border border-white/[0.08] bg-[#070b14]/80 p-4 font-mono text-xs text-slate-300"
      >{{ healthText }}</pre>
    </div>

    <div
      class="rounded-2xl border border-white/[0.08] bg-[#0a0f1c]/60 p-6 text-sm shadow-2xl shadow-black/25 backdrop-blur-xl"
    >
      <div class="text-xs font-semibold uppercase tracking-wider text-slate-500">{{ t('settings.repoTitle') }}</div>
      <p class="mt-2 text-xs text-slate-500">{{ t('settings.repoHint') }}</p>
      <div
        class="mt-3 break-all rounded-xl border border-white/[0.08] bg-[#070b14]/90 px-4 py-3 font-mono text-xs text-slate-200"
      >
        {{ repoUrl }}
      </div>
      <a
        :href="repoUrl"
        target="_blank"
        rel="noopener noreferrer"
        class="mt-4 inline-flex rounded-xl border border-cyan-500/25 bg-cyan-500/[0.08] px-4 py-2.5 text-sm font-semibold text-cyan-100 transition hover:border-cyan-400/40 hover:bg-cyan-500/15"
      >
        {{ t('settings.openRepo') }} →
      </a>
    </div>
  </div>
</template>
