/**
 * @file `services/projects.service.js` — 项目领域逻辑与校验（无 SQL 字符串）。
 * @description
 * - 调 `repositories/projects.repo.js`；需要 400 / 409 时抛 `HttpError`（见 `utils/http.js`，须你先实现）。
 * - 契约：`backend/docs/api.md` §3。
 *
 * 【规范】参考答案只在 `//` 注释；手写区留空。
 */

// ════════════════════════════════════════════════════════════════════
// 段落 1 — 参考答案：依赖
// ════════════════════════════════════════════════════════════════════
// const projectsRepo = require('../repositories/projects.repo')
// const { HttpError } = require('../utils/http')

// ────────────────────────────────────────────────────────────────────
// 手写区 1：依赖
// ────────────────────────────────────────────────────────────────────

const projectsRepo=require('../repositories/projects.repo')
const {HttpError}=require('../utils/http')

// ════════════════════════════════════════════════════════════════════
// 段落 2 — 参考答案：listProjects — 返回 { items }，items 为 repo.listAll()
// ════════════════════════════════════════════════════════════════════
// async function listProjects() {
//   const items = projectsRepo.listAll()
//   return { items }
// }

// ────────────────────────────────────────────────────────────────────
// 手写区 2：listProjects
// ────────────────────────────────────────────────────────────────────

async function listProjects(){
    const items=projectsRepo.listAll()
    return {items}
}

// ════════════════════════════════════════════════════════════════════
// 段落 3 — 参考答案：createProject — trim name；空则 400；重名则 409；否则 insert 返回 { id }
// ════════════════════════════════════════════════════════════════════
// async function createProject(body) {
//   const raw = body && typeof body.name === 'string' ? body.name : ''
//   const name = raw.trim()
//   if (!name) {
//     throw new HttpError(400, 'BAD_REQUEST', 'name is required')
//   }
//   if (projectsRepo.findByName(name)) {
//     throw new HttpError(409, 'CONFLICT', 'project name already exists')
//   }
//   const id = projectsRepo.insert(name)
//   return { id }
// }

// ────────────────────────────────────────────────────────────────────
// 手写区 3：createProject
// ────────────────────────────────────────────────────────────────────

async function createProject(body){
    const raw=body&&typeof body.name==='string'?body.name:''
    const name=raw.trim()
    if(!name){
        throw new HttpError(400,'BAD_REQUEST','name is required')
    }
    if(projectsRepo.findByName(name)){
        throw new HttpError(409,'CONFLICT','project name already exists')
    }
    const id =projectsRepo.insert(name)
    return {id}
}

// ════════════════════════════════════════════════════════════════════
// 段落 4 — 参考答案：导出
// ════════════════════════════════════════════════════════════════════
// module.exports = { listProjects, createProject }

// ────────────────────────────────────────────────────────────────────
// 手写区 4：导出
// ────────────────────────────────────────────────────────────────────


module.exports={listProjects,createProject}
