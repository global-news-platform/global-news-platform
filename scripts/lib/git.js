const { execSync } = require("child_process")
const path = require("path")
const REPO = path.join(__dirname, "..", "..")

function run(args) {
  try {
    const out = execSync(`git ${args}`, { cwd: REPO, encoding: "utf-8", stdio: "pipe" })
    return { ok: true, out: out.trim() }
  } catch (e) {
    return { ok: false, err: e.stderr?.trim() || e.message }
  }
}

function hasChanges() {
  const r = run("status --porcelain")
  return r.ok && r.out.length > 0
}

function commitAll(message) {
  run('config user.name "Global News Bot"')
  run('config user.email "bot@globalnews.news"')
  const stage = run("add -A")
  if (!stage.ok) return { ok: false, err: stage.err }
  const r = run(`commit -m "${message.replace(/"/g, '\\"')}"`)
  return { ok: r.ok, out: r.out, err: r.err }
}

function push() {
  return run("push")
}

module.exports = { hasChanges, commitAll, push }
