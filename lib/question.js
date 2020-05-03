const readline = require("readline")

module.exports = (question, callback, argv) => {
  if (typeof argv === "number" && argv > 0 && process.argv[argv]) {
    callback(process.argv[argv])
  } else {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    })

    rl.question(question, (data) => {
      rl.close()
      callback(data)
    })
  }
}
