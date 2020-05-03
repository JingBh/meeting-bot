const fs = require("fs")

module.exports = (path) => {
  path = fs.realpathSync(path || __dirname + "/../.githubtoken")
  return fs.existsSync(path) ? fs.readFileSync(path).toString().trim() : ""
}
