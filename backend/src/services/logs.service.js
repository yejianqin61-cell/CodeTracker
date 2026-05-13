/**
 * @file 开发日志领域服务：校验、分页默认值、调用 repository。
 * @description
 * - Query / Body 形状见 `docs/api.md` §4。
 * - `project_id` 是否存在可调用 `projects` repo 或直连 SQL，按你架构二选一。
 * - 日期格式 `YYYY-MM-DD` 建议在 `utils/date.js` 中集中校验（若尚未建文件，可暂写在 service 内）。
 *
 * 【注释规范】参考答案仅在 `//` 注释块；手写区留空。
 */

// ════════════════════════════════════════════════════════════════════
// 段落 1 — 参考答案：依赖
// ════════════════════════════════════════════════════════════════════
// const logsRepo = require('../repositories/logs.repo')
// const { HttpError } = require('../utils/http')
// （可选）const projectsRepo = require('../repositories/projects.repo')

// ────────────────────────────────────────────────────────────────────
// 手写区 1：依赖
// ────────────────────────────────────────────────────────────────────

const logsRepo=require('../repositories/logs.repo')
const {HttpError}=require('../utils/http')


// ════════════════════════════════════════════════════════════════════
// 段落 2 — 参考答案：listLogs(query) — 解析 page/page_size 默认值，调 repo，返回 { items, page, page_size, total }
// ════════════════════════════════════════════════════════════════════

// ────────────────────────────────────────────────────────────────────
// 手写区 2：listLogs
// ────────────────────────────────────────────────────────────────────
async function listLogs(query){
  const pageRaw = parseInt(query.page, 10)
  const pageSizeRaw = parseInt(query.page_size, 10)

  const page = Number.isFinite(pageRaw) && pageRaw >= 1 ? pageRaw : 1
  const page_size = Number.isFinite(pageSizeRaw) && pageSizeRaw >= 1 ? pageSizeRaw : 20

  const filters={
      date:query.date,
      project_id:query.project_id?parseInt(query.project_id, 10):undefined,
      q:query.q,
      page,
      page_size
  }

  const total = logsRepo.countLogs(filters)
  const items = logsRepo.listLogs(filters)

  return { items, page, page_size, total }
}


// ════════════════════════════════════════════════════════════════════
// 段落 3 — 参考答案：createLog(body) — 校验字段；可选校验 project_id；返回 { id }
// ════════════════════════════════════════════════════════════════════

// ────────────────────────────────────────────────────────────────────
// 手写区 3：createLog
// ────────────────────────────────────────────────────────────────────
async function createLog(body){
    const {date,project_id,code_lines,duration_minutes,note}=body
    if(typeof date!=='string' || !/^\d{4}-\d{2}-\d{2}$/.test(date)){
        throw new HttpError(400,'BAD_REQUEST','date is required and must be in YYYY-MM-DD format')
    }
    if(typeof project_id!=='number' || project_id<=0){
        throw new HttpError(400,'BAD_REQUEST','project_id is required and must be a positive integer')
    }
    if(typeof code_lines!=='number' || code_lines<0){
        throw new HttpError(400,'BAD_REQUEST','code_lines is required and must be a non-negative integer')
    }
    if(typeof duration_minutes!=='number' || duration_minutes<0){
        throw new HttpError(400,'BAD_REQUEST','duration_minutes is required and must be a non-negative integer')
    }
    if(note !== undefined && note !== null && typeof note!=='string'){
        throw new HttpError(400,'BAD_REQUEST','note must be a string')
    }
    const id=logsRepo.insert({date,project_id,code_lines,duration_minutes,note: note ?? ''})
    return {id}

}


// ════════════════════════════════════════════════════════════════════
// 段落 4 — 参考答案：updateLog(id, body) — 不存在 404
// ════════════════════════════════════════════════════════════════════

// ────────────────────────────────────────────────────────────────────
// 手写区 4：updateLog
// ────────────────────────────────────────────────────────────────────
async function updateLog(id,body){
    const log=logsRepo.findById(id)
    if(!log){
        throw new HttpError(404,'NOT_FOUND','log not found')
    }
    const {date,project_id,code_lines,duration_minutes,note}=body
    if(date!==undefined){
        if(typeof date!=='string' || !/^\d{4}-\d{2}-\d{2}$/.test(date)){
            throw new HttpError(400,'BAD_REQUEST','date must be in YYYY-MM-DD format')
        }
        log.date=date
    }
    if(project_id!==undefined){
        if(typeof project_id!=='number' || project_id<=0){
            throw new HttpError(400,'BAD_REQUEST','project_id must be a positive integer')
        }
        log.project_id=project_id
    }
    if(code_lines!==undefined){
        if(typeof code_lines!=='number' || code_lines<0){
            throw new HttpError(400,'BAD_REQUEST','code_lines must be a non-negative integer')
        }
        log.code_lines=code_lines
    }
    if(duration_minutes!==undefined){
        if(typeof duration_minutes!=='number' || duration_minutes<0){
            throw new HttpError(400,'BAD_REQUEST','duration_minutes must be a non-negative integer')
        }
        log.duration_minutes=duration_minutes
    }
    if(note!==undefined){
        if(typeof note!=='string'){
            throw new HttpError(400,'BAD_REQUEST','note must be a string')
        }
        log.note=note
    }
    logsRepo.update(id,log)
    return {ok:true}

// ════════════════════════════════════════════════════════════════════
// 段落 5 — 参考答案：deleteLog(id) — 不存在 404；成功 { ok: true }
// ════════════════════════════════════════════════════════════════════

// ────────────────────────────────────────────────────────────────────
// 手写区 5：deleteLog
// ────────────────────────────────────────────────────────────────────
}

async function deleteLog(id){
    const log=logsRepo.findById(id)
    if(!log){
        throw new HttpError(404,'NOT_FOUND','log not found')
    }
    logsRepo.deleteById(id)
    return {ok:true}
}    


// ════════════════════════════════════════════════════════════════════
// 段落 6 — 参考答案：module.exports
// ════════════════════════════════════════════════════════════════════
// module.exports = { listLogs, createLog, updateLog, deleteLog }

// ────────────────────────────────────────────────────────────────────
// 手写区 6：导出
// ────────────────────────────────────────────────────────────────────


module.exports = { listLogs, createLog, updateLog, deleteLog }