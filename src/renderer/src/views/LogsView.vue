<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import {
  listLogs,
  createLog,
  updateLog,
  deleteLog,
  type LogItemDto,
  type LogWriteBody,
} from '@/api/logs'
import { listProjects, createProject, type ProjectDto } from '@/api/projects'
import { ApiRequestError } from '@/api/http'
import { todayUtcYmd } from '@/lib/dates'
import { useI18n } from '@/i18n'

const { t, localeTag } = useI18n()

const loading = ref(false)
const errMsg = ref('')
const projects = ref<ProjectDto[]>([])
const items = ref<LogItemDto[]>([])
const page = ref(1)
const pageSize = ref(20)
const total = ref(0)

const filterDate = ref('')
const filterProjectId = ref<number | ''>('')

const modalOpen = ref(false)
const editingId = ref<number | null>(null)
const form = ref<LogWriteBody>({
  date: todayUtcYmd(),
  project_id: 0,
  code_lines: 0,
  duration_minutes: 0,
  note: '',
})

const newProjectName = ref('')
const projectBusy = ref(false)

const totalPages = computed(() => Math.max(1, Math.ceil(total.value / pageSize.value)))

const pageSummary = computed(() =>
  t('logs.pagination', { total: total.value, page: page.value, totalPages: totalPages.value }),
)

async function loadProjects() {
  const r = await listProjects()
  projects.value = r.items
  if (form.value.project_id === 0 && r.items.length > 0) {
    form.value.project_id = r.items[0].id
  }
}

async function loadLogs() {
  loading.value = true
  errMsg.value = ''
  try {
    const r = await listLogs({
      date: filterDate.value || undefined,
      project_id: filterProjectId.value === '' ? undefined : filterProjectId.value,
      page: page.value,
      page_size: pageSize.value,
    })
    items.value = r.items
    page.value = r.page
    pageSize.value = r.page_size
    total.value = r.total
  } catch (e) {
    errMsg.value = e instanceof ApiRequestError ? e.apiMessage() : String(e)
    items.value = []
  } finally {
    loading.value = false
  }
}

async function refresh() {
  await loadProjects()
  await loadLogs()
}

function openCreate() {
  editingId.value = null
  form.value = {
    date: todayUtcYmd(),
    project_id: projects.value[0]?.id ?? 0,
    code_lines: 0,
    duration_minutes: 0,
    note: '',
  }
  modalOpen.value = true
}

function openEdit(row: LogItemDto) {
  editingId.value = row.id
  form.value = {
    date: row.date,
    project_id: row.project_id,
    code_lines: row.code_lines,
    duration_minutes: row.duration_minutes,
    note: row.note ?? '',
  }
  modalOpen.value = true
}

function closeModal() {
  modalOpen.value = false
}

async function submitModal() {
  errMsg.value = ''
  try {
    const body: LogWriteBody = {
      date: form.value.date,
      project_id: Number(form.value.project_id),
      code_lines: Number(form.value.code_lines),
      duration_minutes: Number(form.value.duration_minutes),
      note: form.value.note || '',
    }
    if (editingId.value == null) {
      await createLog(body)
    } else {
      await updateLog(editingId.value, body)
    }
    closeModal()
    await loadLogs()
  } catch (e) {
    errMsg.value = e instanceof ApiRequestError ? e.apiMessage() : String(e)
  }
}

async function onDelete(id: number) {
  if (!confirm(t('logs.confirmDelete'))) return
  errMsg.value = ''
  try {
    await deleteLog(id)
    await loadLogs()
  } catch (e) {
    errMsg.value = e instanceof ApiRequestError ? e.apiMessage() : String(e)
  }
}

async function addProject() {
  const name = newProjectName.value.trim()
  if (!name) {
    errMsg.value = t('logs.needName')
    return
  }
  projectBusy.value = true
  errMsg.value = ''
  try {
    await createProject({ name })
    newProjectName.value = ''
    await loadProjects()
  } catch (e) {
    errMsg.value = e instanceof ApiRequestError ? e.apiMessage() : String(e)
  } finally {
    projectBusy.value = false
  }
}

function applyFilters() {
  page.value = 1
  void loadLogs()
}

function goPage(p: number) {
  page.value = Math.min(Math.max(1, p), totalPages.value)
  void loadLogs()
}

function fmtInt(n: number) {
  return n.toLocaleString(localeTag())
}

function modalTitle() {
  if (editingId.value == null) return t('logs.modalNew')
  return t('logs.modalEdit', { id: editingId.value })
}

onMounted(() => {
  void refresh()
})
</script>

<template>
  <div class="space-y-8">
    <div class="flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 class="text-3xl font-bold tracking-tight text-white">{{ t('logs.title') }}</h1>
        <p class="mt-1 text-sm text-slate-500">{{ t('logs.sub') }}</p>
      </div>
      <div class="flex flex-wrap items-center gap-2">
        <input
          v-model="newProjectName"
          type="text"
          :placeholder="t('logs.newProjectPlaceholder')"
          class="w-40 rounded-xl border border-white/[0.1] bg-[#070b14]/80 px-3 py-2 text-sm text-white placeholder:text-slate-600 outline-none focus:border-violet-400/40 focus:ring-2 focus:ring-violet-400/15"
        />
        <button
          type="button"
          class="rounded-xl border border-white/[0.1] bg-white/[0.05] px-3 py-2 text-sm font-medium text-slate-200 transition hover:bg-white/[0.1]"
          :disabled="projectBusy"
          @click="addProject"
        >
          {{ t('logs.newProject') }}
        </button>
        <button
          type="button"
          class="rounded-xl bg-gradient-to-r from-violet-600 to-cyan-500 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-violet-500/20 transition hover:brightness-110 disabled:opacity-40"
          :disabled="!projects.length"
          @click="openCreate"
        >
          {{ t('logs.newLog') }}
        </button>
      </div>
    </div>

    <div
      v-if="!projects.length"
      class="rounded-2xl border border-dashed border-white/[0.12] bg-white/[0.02] px-4 py-3 text-sm text-slate-400"
    >
      {{ t('logs.noProjectHint') }}
    </div>

    <div
      v-if="errMsg"
      class="rounded-2xl border border-amber-500/25 bg-amber-500/[0.08] px-4 py-3 text-sm text-amber-100"
    >
      {{ errMsg }}
    </div>

    <div
      class="flex flex-wrap items-end gap-4 rounded-2xl border border-white/[0.08] bg-[#0a0f1c]/55 p-5 backdrop-blur-xl"
    >
      <label class="flex flex-col gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
        {{ t('logs.filterDate') }}
        <input
          v-model="filterDate"
          type="date"
          class="rounded-xl border border-white/[0.1] bg-[#070b14]/90 px-3 py-2 text-sm text-white outline-none focus:border-cyan-400/40 focus:ring-2 focus:ring-cyan-400/15"
        />
      </label>
      <label class="flex flex-col gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
        {{ t('logs.filterProject') }}
        <select
          v-model="filterProjectId"
          class="min-w-[10rem] rounded-xl border border-white/[0.1] bg-[#070b14]/90 px-3 py-2 text-sm text-white outline-none focus:border-cyan-400/40 focus:ring-2 focus:ring-cyan-400/15"
        >
          <option value="">{{ t('logs.all') }}</option>
          <option v-for="p in projects" :key="p.id" :value="p.id">{{ p.name }}</option>
        </select>
      </label>
      <button
        type="button"
        class="rounded-xl border border-white/[0.1] bg-white/[0.06] px-4 py-2 text-sm font-medium text-white transition hover:bg-white/[0.1]"
        @click="applyFilters"
      >
        {{ t('logs.applyFilters') }}
      </button>
      <button
        type="button"
        class="rounded-xl border border-white/[0.08] px-4 py-2 text-sm text-slate-300 transition hover:bg-white/[0.05]"
        :disabled="loading"
        @click="refresh"
      >
        {{ t('logs.refresh') }}
      </button>
    </div>

    <div
      class="overflow-hidden rounded-2xl border border-white/[0.08] bg-[#0a0f1c]/50 shadow-2xl shadow-black/30 backdrop-blur-xl"
    >
      <div class="overflow-x-auto">
        <table class="min-w-full text-left text-sm">
          <thead class="border-b border-white/[0.06] bg-white/[0.03] text-[11px] font-semibold uppercase tracking-wider text-slate-500">
            <tr>
              <th class="px-4 py-3">{{ t('logs.thDate') }}</th>
              <th class="px-4 py-3">{{ t('logs.thProject') }}</th>
              <th class="px-4 py-3">{{ t('logs.thLines') }}</th>
              <th class="px-4 py-3">{{ t('logs.thMin') }}</th>
              <th class="px-4 py-3">{{ t('logs.thNotes') }}</th>
              <th class="px-4 py-3 text-right">{{ t('logs.thActions') }}</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="loading">
              <td colspan="6" class="px-4 py-12 text-center text-slate-500">{{ t('common.loading') }}</td>
            </tr>
            <tr v-else-if="!items.length">
              <td colspan="6" class="px-4 py-12 text-center text-slate-500">{{ t('logs.noRows') }}</td>
            </tr>
            <template v-else>
              <tr
                v-for="row in items"
                :key="row.id"
                class="border-b border-white/[0.04] transition hover:bg-white/[0.04]"
              >
                <td class="whitespace-nowrap px-4 py-3 font-mono text-slate-300">{{ row.date }}</td>
                <td class="px-4 py-3">
                  <span
                    class="inline-block rounded-lg border border-violet-400/20 bg-violet-500/10 px-2 py-0.5 text-xs font-semibold text-violet-200"
                  >
                    {{ row.project_name ?? row.project_id }}
                  </span>
                </td>
                <td class="px-4 py-3 font-mono text-cyan-200/90">{{ fmtInt(row.code_lines) }}</td>
                <td class="px-4 py-3 text-slate-400">{{ row.duration_minutes }}</td>
                <td class="max-w-xs truncate px-4 py-3 text-slate-500" :title="row.note">{{ row.note }}</td>
                <td class="whitespace-nowrap px-4 py-3 text-right">
                  <button
                    type="button"
                    class="text-sm font-medium text-cyan-400 hover:text-cyan-300"
                    @click="openEdit(row)"
                  >
                    {{ t('logs.edit') }}
                  </button>
                  <button
                    type="button"
                    class="ml-3 text-sm font-medium text-rose-400 hover:text-rose-300"
                    @click="onDelete(row.id)"
                  >
                    {{ t('logs.delete') }}
                  </button>
                </td>
              </tr>
            </template>
          </tbody>
        </table>
      </div>
      <div
        class="flex flex-wrap items-center justify-between gap-2 border-t border-white/[0.06] px-4 py-3 text-xs text-slate-500"
      >
        <span>{{ pageSummary }}</span>
        <div class="flex gap-2">
          <button
            type="button"
            class="rounded-lg border border-white/[0.1] px-3 py-1.5 text-slate-300 transition hover:bg-white/[0.06] disabled:opacity-40"
            :disabled="page <= 1"
            @click="goPage(page - 1)"
          >
            {{ t('logs.prev') }}
          </button>
          <button
            type="button"
            class="rounded-lg border border-white/[0.1] px-3 py-1.5 text-slate-300 transition hover:bg-white/[0.06] disabled:opacity-40"
            :disabled="page >= totalPages"
            @click="goPage(page + 1)"
          >
            {{ t('logs.next') }}
          </button>
        </div>
      </div>
    </div>

    <div
      v-if="modalOpen"
      class="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
      @click.self="closeModal"
    >
      <div
        class="w-full max-w-md rounded-2xl border border-white/[0.1] bg-[#0c101f] p-6 shadow-[0_0_60px_-12px_rgba(99,102,241,0.45)]"
      >
        <div class="text-base font-semibold text-white">{{ modalTitle() }}</div>
        <div class="mt-5 space-y-4">
          <label class="block">
            <span class="mb-1.5 block text-[11px] font-semibold uppercase tracking-wider text-slate-500">{{
              t('logs.modalDate')
            }}</span>
            <input
              v-model="form.date"
              type="date"
              class="w-full rounded-xl border border-white/[0.1] bg-[#070b14]/90 px-3 py-2.5 text-sm text-white outline-none focus:border-cyan-400/40 focus:ring-2 focus:ring-cyan-400/15"
            />
          </label>
          <label class="block">
            <span class="mb-1.5 block text-[11px] font-semibold uppercase tracking-wider text-slate-500">{{
              t('logs.modalProject')
            }}</span>
            <select
              v-model.number="form.project_id"
              class="w-full rounded-xl border border-white/[0.1] bg-[#070b14]/90 px-3 py-2.5 text-sm text-white outline-none focus:border-violet-400/40 focus:ring-2 focus:ring-violet-400/15"
            >
              <option v-for="p in projects" :key="p.id" :value="p.id">{{ p.name }}</option>
            </select>
          </label>
          <label class="block">
            <span class="mb-1.5 block text-[11px] font-semibold uppercase tracking-wider text-slate-500">{{
              t('logs.modalLines')
            }}</span>
            <input
              v-model.number="form.code_lines"
              type="number"
              min="0"
              class="w-full rounded-xl border border-white/[0.1] bg-[#070b14]/90 px-3 py-2.5 font-mono text-sm text-white outline-none focus:border-cyan-400/40 focus:ring-2 focus:ring-cyan-400/15"
            />
          </label>
          <label class="block">
            <span class="mb-1.5 block text-[11px] font-semibold uppercase tracking-wider text-slate-500">{{
              t('logs.modalMinutes')
            }}</span>
            <input
              v-model.number="form.duration_minutes"
              type="number"
              min="0"
              class="w-full rounded-xl border border-white/[0.1] bg-[#070b14]/90 px-3 py-2.5 font-mono text-sm text-white outline-none focus:border-cyan-400/40 focus:ring-2 focus:ring-cyan-400/15"
            />
          </label>
          <label class="block">
            <span class="mb-1.5 block text-[11px] font-semibold uppercase tracking-wider text-slate-500">{{
              t('logs.modalNotes')
            }}</span>
            <textarea
              v-model="form.note"
              rows="3"
              class="w-full resize-none rounded-xl border border-white/[0.1] bg-[#070b14]/90 px-3 py-2.5 text-sm text-white outline-none focus:border-violet-400/40 focus:ring-2 focus:ring-violet-400/15"
            />
          </label>
        </div>
        <div class="mt-6 flex justify-end gap-2">
          <button
            type="button"
            class="rounded-xl px-4 py-2 text-sm text-slate-400 transition hover:bg-white/[0.05] hover:text-white"
            @click="closeModal"
          >
            {{ t('logs.cancel') }}
          </button>
          <button
            type="button"
            class="rounded-xl bg-gradient-to-r from-violet-600 to-cyan-500 px-5 py-2 text-sm font-semibold text-white shadow-lg shadow-violet-500/25 transition hover:brightness-110"
            @click="submitModal"
          >
            {{ t('logs.save') }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
