const tickerIndexEl = document.getElementById("tickerIndex")
const companyNameEl = document.getElementById("companyName")

const currentPriceEl = document.getElementById("currentPrice")
const priceChangeEl = document.getElementById("priceChange")

const openEl = document.getElementById("open")
const highEl = document.getElementById("high")
const lowEl = document.getElementById("low")
const closeEl = document.getElementById("close")
const volumeEl = document.getElementById("volume")
const avgVolumeEl = document.getElementById("avgVolume")

const searchInputEl = document.getElementById("searchInput")
const searchButtonEl = document.getElementById("searchButton")

function updateCompanyBubble(ticker, name) {
  tickerIndexEl.innerHTML = ticker
  companyNameEl.innerHTML = name
}

function updatePriceBubble(currentPrice, priceChange, percentageChange) {
  currentPriceEl.innerHTML = currentPrice
  priceChangeEl.innerHTML = `${priceChange} (${percentageChange}%)`
}

function updateStatsBubble(open, high, low, close, volume, avgVolume) {
  openEl.innerHTML = open
  highEl.innerHTML = high
  lowEl.innerHTML = low
  closeEl.innerHTML = close
  volumeEl.innerHTML = volume
  avgVolumeEl.innerHTML = avgVolume
}

searchButton.onclick = (event) => {
  event.preventDefault()

  console.log(searchInput.value)

  updateCompanyBubble("AMC", "AMC Corp")
  updatePriceBubble(5, -100, -50)
  updateStatsBubble(1, 1, 1, 1, 1, 1)
}
