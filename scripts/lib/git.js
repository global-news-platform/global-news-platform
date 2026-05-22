const { execSync } = require("child_process")

const BOT_NAME = "Global News Bot"
const BOT_EMAIL = "bot@globalnews.news"

function isGitAvailable() {
  try {
    execSync("git --version", { stdio: "ignore" })
    return true
  } catch {
    return false
  }
}

function hasChanges() {
  try {
    const output = execSync("git status --porcelain", { encoding: "utf-8" })
    return output.trim().length > 0
  } catch {
    return false
  }
}

function stageAll() {
  execSync("git add -A", { stdio: "pipe" })
}

function commit(message) {
  execSync(`git config user.name "${BOT_NAME}"`, { stdio: "pipe" })
  execSync(`git config user.email "${BOT_EMAIL}"`, { stdio: "pipe" })
  execSync(`git commit -m "${message}"`, { stdio: "pipe" })
}

function push() {
  execSync("git push", { stdio: "pipe" })
}

function commitAndPush(message) {
  if (!isGitAvailable()) {
    console.log("Git not available, skipping commit")
    return false
  }

  if (process.env.GIT_DISABLED === "true") {
    console.log("GIT_DISABLED=true, skipping commit")
    return false
  }

  stageAll()

  if (!hasChanges()) {
    console.log("No changes to commit")
    return false
  }

  commit(message)
  console.log(`Committed: ${message}`)

  try {
    push()
    console.log("Pushed to remote")
  } catch (err) {
    console.log(`Push failed (may not have remote): ${err.message}`)
  }

  return true
}

function getCurrentBranch() {
  try {
    return execSync("git rev-parse --abbrev-ref HEAD", {
      encoding: "utf-8",
    }).trim()
  } catch {
    return "unknown"
  }
}

function getLastCommitMessage() {
  try {
    return execSync("git log -1 --pretty=%B", { encoding: "utf-8" }).trim()
  } catch {
    return ""
  }
}

module.exports = {
  isGitAvailable,
  hasChanges,
  stageAll,
  commit,
  push,
  commitAndPush,
  getCurrentBranch,
  getLastCommitMessage,
}
