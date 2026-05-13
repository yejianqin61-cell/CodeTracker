/**
 * @file 日期字符串工具（与 `docs/api.md` 的 `date` / `from` / `to` 约定一致）。
 * @description
 * - 纯函数：无 I/O、无 Express；供 `services/*.js` 复用。
 * - 默认用 **UTC 日历日** 解析 `YYYY-MM-DD`，避免 `new Date('2026-05-13')` 在部分时区出现“前一天”歧义。
 *
 * 【注释规范】参考答案只在 `//`；`// ─── 手写区` 下留空，由你亲自写实现。
 */

// ════════════════════════════════════════════════════════════════════
// 段落 1 — 参考答案：isYyyyMmDd(value)
// ════════════════════════════════════════════════════════════════════
// function isYyyyMmDd(value) {
//   if (typeof value !== 'string') return false
//   if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false
//   const [y, m, d] = value.split('-').map(Number)
//   const dt = new Date(Date.UTC(y, m - 1, d))
//   return dt.getUTCFullYear() === y && dt.getUTCMonth() === m - 1 && dt.getUTCDate() === d
// }

// ────────────────────────────────────────────────────────────────────
// 手写区 1：isYyyyMmDd
// ────────────────────────────────────────────────────────────────────

function isYyyyMmDd(value){
    if(typeof value!=='string')return false
    if(!/^\d{4}-\d{2}-\d{2}$/.test(value))return false
    const [y,m,d]=value.split('-').map(Number)
    const dt=new Date(Date.UTC(y,m-1,d))
    return dt.getUTCFullYear()===y && dt.getUTCMonth()===m-1 && dt.getUTCDate()===d
}

// ════════════════════════════════════════════════════════════════════
// 段落 2 — 参考答案：parseDateRange(from, to) — 校验格式 + from <= to；否则抛 HttpError
// ════════════════════════════════════════════════════════════════════
// const { HttpError } = require('./http')
// function parseDateRange(from, to) {
//   if (!isYyyyMmDd(from) || !isYyyyMmDd(to)) {
//     throw new HttpError(400, 'BAD_REQUEST', 'from/to 必须为 YYYY-MM-DD')
//   }
//   if (from > to) {
//     throw new HttpError(400, 'BAD_REQUEST', 'from 不能大于 to')
//   }
//   return { from, to }
// }

// ────────────────────────────────────────────────────────────────────
// 手写区 2：parseDateRange（若不想依赖 HttpError，可先只 return 或抛普通 Error）
// ────────────────────────────────────────────────────────────────────

const {HttpError}=require('./http')
function parseDateRange(from,to){
    if(!isYyyyMmDd(from) || !isYyyyMmDd(to)){
        throw new HttpError(400,'BAD_REQUEST','from/to must be in YYYY-MM-DD format')
    }
    if(from>to){
        throw new HttpError(400,'BAD_REQUEST','from cannot be greater than to')
    }
    return {from,to}
}

// ════════════════════════════════════════════════════════════════════
// 段落 3 — 参考答案：todayYyyyMmDd() — 供 summary 默认「今天」
// ════════════════════════════════════════════════════════════════════
// function todayYyyyMmDd() {
//   const d = new Date()
//   const y = d.getUTCFullYear()
//   const m = String(d.getUTCMonth() + 1).padStart(2, '0')
//   const day = String(d.getUTCDate()).padStart(2, '0')
//   return `${y}-${m}-${day}`
// }

// ────────────────────────────────────────────────────────────────────
// 手写区 3：todayYyyyMmDd（若你希望跟「用户本地时区」一致，可改用本地 getFullYear 等）
// ────────────────────────────────────────────────────────────────────

function todayYyyyMmDd(){
    const d=new Date()
    const y=d.getUTCFullYear()
    const m=String(d.getUTCMonth()+1).padStart(2,'0')
    const day=String(d.getUTCDate()).padStart(2,'0')
    return `${y}-${m}-${day}`
}


// ════════════════════════════════════════════════════════════════════
// 段落 4 — 参考答案：导出
// ════════════════════════════════════════════════════════════════════
// module.exports = { isYyyyMmDd, parseDateRange, todayYyyyMmDd }

// ────────────────────────────────────────────────────────────────────
// 手写区 4：导出
// ────────────────────────────────────────────────────────────────────
module.exports={isYyyyMmDd,parseDateRange,todayYyyyMmDd}

