# CodeTracker（MVP）后端 API 路由表

> 目标：本地离线桌面应用调用（Electron 渲染进程 → `http://localhost:{PORT}`）。
>
> 约定：所有接口统一 JSON；成功默认 `200`；失败返回统一错误结构（见本文末尾）。

---

## 1. 基础约定

### 1.1 Base URL

- `http://localhost:{PORT}`
- API 前缀：`/api`

### 1.2 通用字段约定

- **date**：统一使用 `YYYY-MM-DD`（字符串）
- **duration_minutes**：整数分钟
- **code_lines**：整数行数
- **created_at**：SQLite `CURRENT_TIMESTAMP`（或你统一格式化后输出）

---

## 2. 健康检查（Health）

### 2.1 `GET /api/health`

- **用途**：确认服务进程存活、（可选）数据库可用。
- **Query**：无
- **Body**：无
- **200 Response**（示例）：

```json
{
  "ok": true,
  "service": "codetracker-backend",
  "time": "2026-05-07T15:00:00.000Z"
}
```

---

## 3. 项目（Projects）

> MVP 建议保留项目表：日志录入时选择项目，统计时按项目聚合会更顺。

### 3.1 `GET /api/projects`

- **用途**：获取项目列表（用于下拉选择/筛选）。
- **Query**：无
- **Body**：无
- **200 Response**：

```json
{
  "items": [
    { "id": 1, "name": "Dorm", "created_at": "2026-05-07 10:00:00" }
  ]
}
```

### 3.2 `POST /api/projects`

- **用途**：创建项目。
- **Body**：

```json
{ "name": "Dorm" }
```

- **200 Response**：

```json
{ "id": 1 }
```

- **建议错误**
  - `400`：name 缺失/空字符串
  - `409`：name 已存在（如果你做唯一约束）

---

## 4. 日志（Logs）

### 4.1 `GET /api/logs`

- **用途**：日志列表查询（支持按日期/项目筛选、分页）。
- **Query（全部可选）**
  - `date=YYYY-MM-DD`：按某天过滤
  - `project_id=number`
  - `q=string`：按 note 关键词模糊搜索（MVP 可后做）
  - `page=number`：从 1 开始
  - `page_size=number`：默认 20（你决定）

- **200 Response**：

```json
{
  "items": [
    {
      "id": 1,
      "date": "2026-05-07",
      "project_id": 1,
      "project_name": "Dorm",
      "code_lines": 532,
      "duration_minutes": 150,
      "note": "完成：评论系统；登录状态修复",
      "created_at": "2026-05-07 11:00:00"
    }
  ],
  "page": 1,
  "page_size": 20,
  "total": 1
}
```

> 说明：`project_name` 是否返回由你决定；返回了前端更省一次 join/请求。

### 4.2 `POST /api/logs`

- **用途**：新增日志（MVP 最重要写入路径）。
- **Body**：

```json
{
  "date": "2026-05-07",
  "project_id": 1,
  "code_lines": 532,
  "duration_minutes": 150,
  "note": "完成：评论系统；登录状态修复"
}
```

- **200 Response**：

```json
{ "id": 1 }
```

- **建议错误**
  - `400`：字段缺失/类型不合法（date 格式不对、负数等）
  - `404`：project_id 不存在（如果你做强校验）

### 4.3 `PUT /api/logs/:id`

- **用途**：编辑日志。
- **Path Params**
  - `id=number`
- **Body**（同新增）：

```json
{
  "date": "2026-05-07",
  "project_id": 1,
  "code_lines": 600,
  "duration_minutes": 160,
  "note": "补充：优化了查询性能"
}
```

- **200 Response**：

```json
{ "ok": true }
```

- **建议错误**
  - `404`：log 不存在

### 4.4 `DELETE /api/logs/:id`

- **用途**：删除日志。
- **Path Params**
  - `id=number`
- **200 Response**：

```json
{ "ok": true }
```

- **建议错误**
  - `404`：log 不存在

---

## 5. 统计（Stats）

### 5.1 `GET /api/summary`

- **用途**：Dashboard 汇总（今日/总计/连续天数）。
- **Query**
  - `date=YYYY-MM-DD`（可选；不传则默认“今天”）

- **200 Response**：

```json
{
  "date": "2026-05-07",
  "today_code_lines": 652,
  "today_duration_minutes": 230,
  "total_code_lines": 12345,
  "total_duration_minutes": 6789,
  "streak_days": 7
}
```

> streak_days 口径建议：从查询日期往前连续有“至少一条日志”的天数。

### 5.2 `GET /api/heatmap`

- **用途**：热力图数据（按日聚合，前端直接画格子）。
- **Query**
  - `from=YYYY-MM-DD`（必填）
  - `to=YYYY-MM-DD`（必填）

- **200 Response**：

```json
{
  "items": [
    {
      "date": "2026-05-07",
      "code_lines": 652,
      "duration_minutes": 230,
      "intensity": 3
    }
  ]
}
```

> intensity 建议由后端计算为 0-4（前端只做颜色映射），避免算法两边不一致。

---

## 6. 统一错误响应（建议）

### 6.1 错误响应结构

```json
{
  "error": {
    "code": "BAD_REQUEST",
    "message": "date 格式必须为 YYYY-MM-DD"
  }
}
```

### 6.2 建议 HTTP 状态码

- `400`：参数错误/校验失败
- `404`：资源不存在
- `409`：冲突（如 project name 唯一）
- `500`：未捕获异常（不要把内部堆栈直接返回给前端）

