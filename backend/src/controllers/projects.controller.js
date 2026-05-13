/**
 * @file `controllers/projects.controller.js` — HTTP 入参/出参适配（无 SQL）。
 * @description
 * - 调 `services/projects.service.js`；异常走 `next(err)`，由全局 error 中间件处理。
 * - 契约：`backend/docs/api.md` §3。
 *
 * 【规范】参考答案只在 `//` 注释；手写区留空。
 */

// ════════════════════════════════════════════════════════════════════
// 段落 1 — 参考答案：依赖
// ════════════════════════════════════════════════════════════════════
// const projectsService = require('../services/projects.service')

// ────────────────────────────────────────────────────────────────────
// 手写区 1：依赖
// ────────────────────────────────────────────────────────────────────
const projectsService=require('../services/projects.service')


// ════════════════════════════════════════════════════════════════════
// 段落 2 — 参考答案：listProjects — GET /api/projects → res.json(await service.listProjects())
// ════════════════════════════════════════════════════════════════════
// async function listProjects(req, res, next) {
//   try {
//     const data = await projectsService.listProjects()
//     res.json(data)
//   } catch (err) {
//     next(err)
//   }
// }

// ────────────────────────────────────────────────────────────────────
// 手写区 2：listProjects
// ────────────────────────────────────────────────────────────────────

async function listProjects(req,res,next){
    try{
        const data=await projectsService.listProjects()
        res.json(data)
    
    
}catch(err){
    next(err)
}

// ════════════════════════════════════════════════════════════════════
// 段落 3 — 参考答案：createProject — POST body；res.json({ id })
// ════════════════════════════════════════════════════════════════════
// async function createProject(req, res, next) {
//   try {
//     const data = await projectsService.createProject(req.body ?? {})
//     res.json(data)
//   } catch (err) {
//     next(err)
//   }
// }

// ────────────────────────────────────────────────────────────────────
// 手写区 3：createProject
// ────────────────────────────────────────────────────────────────────
    async function createProject(req,res,next){
        try{
            const data=await projectsService.createProject(req.body??{})
            res.json(data)
        }catch(err){
            next(err)
        }
    }


// ════════════════════════════════════════════════════════════════════
// 段落 4 — 参考答案：导出
// ════════════════════════════════════════════════════════════════════
// module.exports = { listProjects, createProject }

// ────────────────────────────────────────────────────────────────────
// 手写区 4：导出
// ────────────────────────────────────────────────────────────────────

module.exports={listProjects,createProject}
