const getWindow = require("./getwindow")

module.exports = (bounds) => {
  bounds = bounds || getWindow().bounds
  return {
    x: bounds.x + bounds.width - 315,
    y: bounds.y + Math.round((1 - 0.1328 / 2) * bounds.height)
  }
}
