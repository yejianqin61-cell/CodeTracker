/**
 * @file 健康检查 HTTP 处理器：返回固定 JSON，便于进程与负载均衡探活。
 */

function getHealth(req, res) {
  res.json({
    ok: true,
    service: 'code-tracker-backend',
    time: new Date().toISOString()
  })
}

module.exports = { getHealth }
