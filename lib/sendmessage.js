const robot = require("robotjs")
const clipboardy = require('clipboardy')

const getInput = require("./getinput")

module.exports = (message) => {
  message = (message || "").trim()
  if (message) {
    const input = getInput()

    robot.moveMouse(input.x, input.y)
    robot.mouseClick()

    clipboardy.writeSync(message)
    robot.keyTap("v", "control")
    robot.keyTap("enter")
  }
}
