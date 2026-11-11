export const LEVELS = ['off', 'lite', 'full', 'ultra']

export function normalizeMode(value) {
  if (typeof value !== 'string') return null
  const v = value.trim().toLowerCase()
  return LEVELS.includes(v) ? v : null
}

const DEACTIVATION = new Set([
  'stop ponytail', 'normal mode',
  '停止 ponytail', '关闭 ponytail', '普通模式', '正常模式',
])

export function isDeactivation(text) {
  if (typeof text !== 'string') return false
  return DEACTIVATION.has(text.trim().toLowerCase().replace(/[\s.!?。？！]+$/, ''))
}

// 去掉开头 YAML frontmatter，正文交给模型。
export function stripFrontmatter(markdown) {
  const text = String(markdown).replace(/^\uFEFF/, '')
  const m = /^---\r?\n[\s\S]*?\r?\n---\r?\n?/.exec(text)
  return (m ? text.slice(m[0].length) : text).trim()
}
