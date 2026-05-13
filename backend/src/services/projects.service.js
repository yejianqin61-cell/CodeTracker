/**
 * @file 项目领域服务：入参校验与 repository 编排。
 * @description
 * 抛出的 `HttpError` 由全局错误中间件转换为稳定 JSON。
 * @see backend/docs/api.md（Projects）
 */

const projectsRepo = require('../repositories/projects.repo')
const { HttpError } = require('../utils/http')

/**
 * 返回项目列表，供 `GET /api/projects`。
 * @returns {Promise<{ items: Array<{ id: number, name: string, created_at: string }> }>}
 */
async function listProjects() {
  const items = projectsRepo.listAll()
  return { items }
}

/**
 * 创建项目，供 `POST /api/projects`。
 * @param {{ name?: unknown }} body
 * @returns {Promise<{ id: number }>}
 */
async function createProject(body) {
  const raw = body && typeof body.name === 'string' ? body.name : ''
  const name = raw.trim()
  if (!name) {
    throw new HttpError(400, 'BAD_REQUEST', 'name is required')
  }
  if (projectsRepo.findByName(name)) {
    throw new HttpError(409, 'CONFLICT', 'project name already exists')
  }
  const id = projectsRepo.insert(name)
  return { id }
}

module.exports = {
  listProjects,
  createProject
}
