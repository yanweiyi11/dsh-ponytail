// 按指定上游 commit 刷新 skills/*/SKILL.md。
// 用法: node scripts/sync-upstream.mjs [commit]
import { writeFileSync, mkdirSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { join } from 'node:path'

const COMMIT = process.argv[2] || '7801d061243d7b753bad0e0b3c057cd250b11755'
const NAMES = ['ponytail', 'ponytail-review', 'ponytail-audit', 'ponytail-debt', 'ponytail-gain', 'ponytail-help']
const ROOT = fileURLToPath(new URL('..', import.meta.url))
const BASE = `https://raw.githubusercontent.com/DietrichGebert/ponytail/${COMMIT}/skills`

for (const name of NAMES) {
  const res = await fetch(`${BASE}/${name}/SKILL.md`)
  if (!res.ok) throw new Error(`${name}: HTTP ${res.status}`)
  const text = await res.text()
  // 本地改动：不锁定英文输出，改为跟随用户语言。
  const neutral = text.replaceAll('Very simple English: short sentences, everyday words.', 'Use the language the user writes in. Short sentences, everyday words.')
  const dir = join(ROOT, 'skills', name)
  mkdirSync(dir, { recursive: true })
  writeFileSync(join(dir, 'SKILL.md'), neutral)
  console.log(`wrote skills/${name}/SKILL.md (${neutral.length} bytes)`)
}
console.log(`Synced ${NAMES.length} skill files from ${COMMIT}.`)
