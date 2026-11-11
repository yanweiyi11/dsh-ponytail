import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { join } from 'node:path'
import { normalizeMode, isDeactivation, stripFrontmatter } from './lib.js'

export const name = 'dsh-ponytail'
export const inject = ['systemPrompt', 'skills']

const SECTION_ORDER = 40
const SKILLS_DIR = fileURLToPath(new URL('./skills', import.meta.url))

const ONE_SHOTS = [
  { name: 'ponytail-review', description: 'Review a change for bugs, risk, load, missing tests, speed, and code that should not exist.' },
  { name: 'ponytail-audit', description: 'Audit a whole repo, ranked: bugs, risk, load, missing tests, speed, and what to delete or merge.' },
  { name: 'ponytail-debt', description: 'List every shortcut: comment as a debt ledger with its ceiling and upgrade path.' },
  { name: 'ponytail-gain', description: 'Show the ponytail measured-impact scoreboard: less code, less cost, more speed.' },
  { name: 'ponytail-help', description: 'Quick reference for ponytail levels, skills, and commands.' },
]

function readSkill(skillName) {
  return stripFrontmatter(readFileSync(join(SKILLS_DIR, skillName, 'SKILL.md'), 'utf8'))
}

function levelDirective(mode) {
  if (mode === 'lite') return 'Level: lite. Build what was asked; name a smaller option in one line and let the user pick.'
  if (mode === 'ultra') return 'Level: ultra. Also question the request and push back on anything the need does not justify before building.'
  return 'Level: full. The smallest complete change, a check where the logic needs one, and a reply that names what was skipped and any risk.'
}

export function apply(ctx, config = {}) {
  const core = readSkill('ponytail')
  const defaultMode = normalizeMode(config?.defaultMode) ?? normalizeMode(process.env.PONYTAIL_DEFAULT_MODE) ?? 'full'
  const overrides = new Map()
  const keyOf = agent => (agent?.id ?? agent?.session?.id ?? null)
  const modeOf = agent => {
    const key = keyOf(agent)
    return key !== null && overrides.has(key) ? overrides.get(key) : defaultMode
  }

  ctx.systemPrompt.section({
    name: 'dsh-ponytail',
    order: SECTION_ORDER,
    text: ({ agent }) => {
      const mode = modeOf(agent)
      if (mode === 'off') return ''
      return [`PONYTAIL MODE ACTIVE — ${levelDirective(mode)}`, '', core].join('\n')
    },
  })

  for (const skill of ONE_SHOTS) {
    ctx.skills.register({
      name: skill.name,
      description: skill.description,
      source: 'runtime',
      content: readSkill(skill.name),
      invocation: { modelInvocable: true, userInvocable: true },
    })
  }

  ctx.inject(['commands'], commandCtx => {
    commandCtx.commands.register({
      name: 'ponytail',
      description: 'Set or show the ponytail level',
      input: { hint: '[lite|full|ultra|off|status]' },
      handler: ({ agent, rawInput }) => {
        const input = String(rawInput ?? '').trim().toLowerCase()
        if (input === '' || input === 'status') {
          return { kind: 'success', text: `Ponytail level: ${modeOf(agent)}. Use /ponytail lite|full|ultra|off.` }
        }
        const mode = normalizeMode(input)
        if (!mode) return { kind: 'error', text: 'Usage: /ponytail [lite|full|ultra|off|status]' }
        const key = keyOf(agent)
        if (key !== null) overrides.set(key, mode)
        return { kind: 'success', text: mode === 'off' ? 'Ponytail off.' : `Ponytail level: ${mode}.` }
      },
    })
  })

  ctx.on('agent/disposed', ({ agent }) => {
    const key = keyOf(agent)
    if (key !== null) overrides.delete(key)
  })

  ctx.on('agent/pre-step', async (payload, next) => {
    const text = (payload.messages ?? [])
      .flatMap(message => (message.content ?? []).filter(block => block.type === 'text').map(block => block.text))
      .join('\n')
    const key = keyOf(payload.agent)
    if (key !== null && isDeactivation(text)) overrides.set(key, 'off')
    return next()
  })
}
