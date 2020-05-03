const httpsProxyAgent = require("https-proxy-agent")
const moment = require("moment")
const { Octokit } = require("@octokit/rest")

const sendMessage = require("../lib/sendmessage")
const question = require("../lib/question")
const gitHubToken = require("../lib/githubtoken")

moment.locale("zh-cn")
const octokit = new Octokit({
  auth: gitHubToken(),
  timeZone: "Asia/Shanghai",
  request: {
    agent: httpsProxyAgent("http://127.0.0.1:10809")
  }
})

let lastUpdate = {}
let retriesAll = {}

function fetchCommits(owner, repo, branch) {
  // const timeNow = moment().toISOString();

  let options = {
    owner, repo,
    sha: branch
  }

  if (lastUpdate[branch]) {
    const lastTime = moment(lastUpdate[branch], moment.ISO_8601)
    options.since = lastTime.add(1, "seconds").toISOString()
  }

  octokit.repos.listCommits(options).then(({ data }) => {
    const queue = []
    let firstQuery = false

    for (let i in data) {
      let commit = data[i]

      commit.branch = branch

      if (lastUpdate[branch]) {
        queue.unshift(commit)
      } else firstQuery = true

      if (firstQuery) {
        lastUpdate[branch] = commit.commit.author.date
        break
      }
    }

    for (let commit of queue) {
      const commitTimeRaw = lastUpdate[branch] = commit.commit.author.date
      const commitTime = moment(commitTimeRaw, moment.ISO_8601).fromNow()
      const commitHash = commit.sha.substring(0, 6)
      sendMessage(`${commitTime} ${commit.commit.author.name} 在 ${commit.branch} 分支创建了 commit ${commitHash}：${commit.commit.message}`)
    }
  }).catch((error) => {

    let retries = retriesAll[branch] || 0
    if (retries <= 5) {
      retriesAll[branch] = retries + 1

      fetchCommits(owner, repo, branch)

    } else console.error(error)
  }).finally(() => {
    console.log(`Updated ${branch} since ${options.since}`)
  })
}

question("Repo to watch: ", (data) => {
  [owner, repo] = data.split("/")

  octokit.repos.get({
    owner, repo
  }).then(({ data }) => {
    sendMessage(`这里是 MeetingBot，目前已启用 github.js，将为您提供 GitHub 最新动态 ~\n\n当前正在追踪：${data.full_name}\n${data.description}`)

    octokit.repos.listBranches({
      owner, repo,
      protected: false
    }).then(({ data }) => {
      const branches = []

      for (let i in data) {
        let branch = data[i]

        branches.push(branch.name)

        setTimeout((owner, repo, branch) => {

          fetchCommits(owner, repo, branch)
          setInterval(fetchCommits, 5000 * branches.length, owner, repo, branch)

        }, 500 * i, owner, repo, branch.name)
      }

      sendMessage(`查询到 ${branches.length} 个分支，分别为 ${branches.join("、")}，正在追踪。`)

    }).catch(console.error)

  }).catch(console.error)

}, 2)
