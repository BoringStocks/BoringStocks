// Source: https://stackoverflow.com/a/40724354/7897036
export function abbreviateNumber(number) {
  var SYMBOL = ["", "k", "M", "B", "T", "Q", "E"]

  var tier = (Math.log10(Math.abs(number)) / 3) | 0
  if (tier == 0) return number
  var suffix = SYMBOL[tier]
  var scale = Math.pow(10, tier * 3)
  var scaled = number / scale

  return scaled.toFixed(3) + suffix
}
