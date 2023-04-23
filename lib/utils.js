'use strict'

function isDST (d) {
  const jan = new Date(d.getFullYear(), 0, 1).getTimezoneOffset()
  const jul = new Date(d.getFullYear(), 6, 1).getTimezoneOffset()
  return Math.max(jan, jul) !== d.getTimezoneOffset()
}

module.exports = {
  isDST
}
