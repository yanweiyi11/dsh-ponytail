// 自检：frontmatter 剥离、级别/停用分支，以及 apply 的接线（假 ctx）。
import assert from 'node:assert/strict'
import { readFileSync, existsSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { join } from 'node:path'
import { stripFrontmatter, normalizeMode, isDeactivation } from '../lib.js'
import { apply } from '../index.js'

assert.equal(normalizeMode('LITE'), 'lite')
assert.equal(normalizeMode(' ultra '), 'ultra')
assert.equal(normalizeMode('bogus'), null)
assert.equal(normalizeMode(undefined), null)
assert.equal(isDeactivation('Stop ponytail.'), true)
assert.equal(isDeactivation('normal mode'), true)
assert.equal(isDeactivation('add a normal mode toggle'), false)
assert.equal(stripFrontmatter('---\nname: x\n---\n\nBody\n'), 'Body')

const root = fileURLToPath(new URL('..', import.meta.url))
const names = ['ponytail', 'ponytail-review', 'ponytail-audit', 'ponytail-debt', 'ponytail-gain', 'ponytail-help']
for (const name of names) {
  const file = join(root, 'skills', name, 'SKILL.md')
  assert.ok(existsSync(file), `${name} SKILL.md missing`)
  assert.ok(stripFrontmatter(readFileSync(file, 'utf8')).length > 40, `${name} body too short`)
}
assert.ok(stripFrontmatter(readFileSync(join(root, 'skills', 'ponytail', 'SKILL.md'), 'utf8')).includes('lazy senior developer'))
for (const name of ['ponytail-review', 'ponytail-audit']) {
  const body = stripFrontmatter(readFileSync(join(root, 'skills', name, 'SKILL.md'), 'utf8'))
  assert.ok(!body.includes('Very simple English'), `${name} still forces English`)
  assert.ok(body.includes('language the user writes in'), `${name} missing language-follow rule`)
}

process.env.PONYTAIL_DEFAULT_MODE = 'lite'
const registered = []
let sectionText
let commandHandler
const ctx = {
  systemPrompt: { section: options => { sectionText = options.text } },
  skills: { register: skill => { registered.push(skill.name); return () => {} } },
  inject: (deps, callback) => callback({ commands: { register: options => { commandHandler = options.handler } } }),
  on: () => {},
}
apply(ctx, {})
assert.deepEqual(registered.sort(), ['ponytail-audit', 'ponytail-debt', 'ponytail-gain', 'ponytail-help', 'ponytail-review'])
const agent = { session: { id: 's1' } }
assert.match(sectionText({ agent }), /lazy senior developer/)
assert.match(sectionText({ agent }), /Level: lite/)
commandHandler({ agent, rawInput: 'off' })
assert.equal(sectionText({ agent }), '')
commandHandler({ agent, rawInput: 'ultra' })
assert.match(sectionText({ agent }), /Level: ultra/)
console.log('ok: lib logic, 6 skill files, apply wiring')
