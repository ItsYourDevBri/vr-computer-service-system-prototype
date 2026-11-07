import { readdirSync, statSync } from 'node:fs'
import { join } from 'node:path'
import { spawnSync } from 'node:child_process'

const roots = ['src', 'tests', 'scripts']
const entryFiles = ['vite.config.js', 'playwright.config.js']
const files = [...entryFiles]

function visit(directory) {
  for (const name of readdirSync(directory)) {
    const path = join(directory, name)
    const details = statSync(path)
    if (details.isDirectory()) visit(path)
    else if (path.endsWith('.js')) files.push(path)
  }
}

for (const root of roots) visit(root)

let failed = false
for (const file of [...new Set(files)]) {
  const result = spawnSync(process.execPath, ['--check', file], { stdio: 'inherit' })
  if (result.status !== 0) failed = true
}

if (failed) process.exitCode = 1
else console.log(`Validated JavaScript syntax in ${new Set(files).size} files.`)
