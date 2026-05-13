import { ref, watch } from 'vue'
import { en, zh, type MessageKey } from './messages'

export type Locale = 'en' | 'zh'

const STORAGE_KEY = 'codetracker-locale'

const dict = { en, zh }

function readStoredLocale(): Locale {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw === 'en' || raw === 'zh') return raw
  } catch {
    /* ignore */
  }
  return 'zh'
}

export const locale = ref<Locale>(readStoredLocale())

watch(
  locale,
  (l) => {
    try {
      localStorage.setItem(STORAGE_KEY, l)
    } catch {
      /* ignore */
    }
    document.documentElement.lang = l === 'zh' ? 'zh-CN' : 'en'
  },
  { immediate: true },
)

export function setLocale(next: Locale) {
  locale.value = next
}

export function useI18n() {
  const t = (key: MessageKey, vars?: Record<string, string | number>): string => {
    const pack = dict[locale.value]
    let s = pack[key] ?? dict.en[key] ?? String(key)
    if (vars) {
      for (const [k, v] of Object.entries(vars)) {
        s = s.replaceAll(`{${k}}`, String(v))
      }
    }
    return s
  }

  const localeTag = () => (locale.value === 'zh' ? 'zh-CN' : 'en-US')

  return { locale, setLocale, t, localeTag }
}
