const activeWin = require('active-win')
const sleep = require("./sleep")

module.exports = function () {
  let data, infoPrinted = false

  while (true) {
    data = activeWin.sync()

    if (data && data.owner.name.startsWith('wemeetapp')) {

      console.log(`Found wemeetapp window: [${data.owner.processId}] ${data.owner.name}`)

      return data

    } else {
      if (!infoPrinted) {

        console.log("Please focus on the wemeetapp window.")
        infoPrinted = true
      }

      sleep(1000)
    }
  }
}
