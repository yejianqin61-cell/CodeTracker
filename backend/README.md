# backend（MVP）

本目录用于放置 **Express + SQLite** 的后端代码（本地端口，仅供桌面应用调用）。

## 建议文件树（已创建占位文件）

```
backend/
  README.md
  .env.example
  src/
    index.js
    app.js
    config/
      env.js
    db/
      index.js
      schema.sql
      migrations/
        .keep
    routes/
      index.js
      health.routes.js
      projects.routes.js
      logs.routes.js
      stats.routes.js
    controllers/
      health.controller.js
      projects.controller.js
      logs.controller.js
      stats.controller.js
    services/
      projects.service.js
      logs.service.js
      stats.service.js
    repositories/
      projects.repo.js
      logs.repo.js
    middlewares/
      error.middleware.js
    utils/
      date.js
      http.js
    types/
      api.d.ts
```

