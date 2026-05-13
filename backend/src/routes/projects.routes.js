/**
 * @fileoverview Projects 路由：将 `/api/projects` 映射到 controller。
 * @description
 * 挂载链：`app` → `/api`（`app.js`）→ `routes/index.js` 的 `/projects` → 本 router。
 * 本文件中的 `'/'` 即 **`/api/projects`**。
 * @see {@link ../controllers/projects.controller.js}
 * @see backend/docs/api.md §3
 */

const express = require('express')
const projectsController = require('../controllers/projects.controller')

const router = express.Router()

router.get('/', projectsController.listProjects)
router.post('/', projectsController.createProject)

module.exports = router
