/**
 * @file Projects HTTP 控制器：解析请求、调用 service、写出 JSON。
 * @description
 * 不写 SQL；异常统一 `next(err)`，由 `middlewares/error.middleware.js` 处理。
 * @see backend/docs/api.md §3
 */

const projectsService = require('../services/projects.service')

/**
 * `GET /api/projects`
 * @type {import('express').RequestHandler}
 */
async function listProjects(req, res, next) {
  try {
    const data = await projectsService.listProjects()
    res.json(data)
  } catch (err) {
    next(err)
  }
}

/**
 * `POST /api/projects`，Body：`{ name: string }`
 * @type {import('express').RequestHandler}
 */
async function createProject(req, res, next) {
  try {
    const data = await projectsService.createProject(req.body ?? {})
    res.json(data)
  } catch (err) {
    next(err)
  }
}

module.exports = {
  listProjects,
  createProject
}
