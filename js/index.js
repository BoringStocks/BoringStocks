const tickerIndexEls = document.getElementsByClassName("tickerIndex")
const companyNameEls = document.getElementsByClassName("companyName")

const currentPriceEls = document.getElementsByClassName("currentPrice")
const priceChangeEls = document.getElementsByClassName("priceChange")

const openEls = document.getElementsByClassName("open")
const highEls = document.getElementsByClassName("high")
const lowEls = document.getElementsByClassName("low")
const closeEls = document.getElementsByClassName("close")
const volumeEls = document.getElementsByClassName("volume")
const avgVolumeEls = document.getElementsByClassName("avgVolume")

const searchInputEls = document.getElementsByClassName("searchInput")
const searchButtonEls = document.getElementsByClassName("searchButton")

function updateCompanyBubble(ticker, name) {
  for (tickerIndexEl of tickerIndexEls) {
    tickerIndexEl.innerHTML = ticker
  }
  for (companyNameEl of companyNameEls) {
    companyNameEl.innerHTML = name
  }
}

function updatePriceBubble(currentPrice, priceChange, percentageChange) {
  for (currentPriceEl of currentPriceEls) {
    currentPriceEl.innerHTML = currentPrice
  }
  for (priceChangeEl of priceChangeEls) {
    priceChangeEl.innerHTML = `${priceChange} (${percentageChange}%)`
  }
}

function updateStatsBubble(open, high, low, close, volume, avgVolume) {
  for (openEl of openEls) {
    openEl.innerHTML = open
  }
  for (highEl of highEls) {
    highEl.innerHTML = high
  }
  for (lowEl of lowEls) {
    lowEl.innerHTML = low
  }
  for (closeEl of closeEls) {
    closeEl.innerHTML = close
  }
  for (volumeEl of volumeEls) {
    volumeEl.innerHTML = volume
  }
  for (avgVolumeEl of avgVolumeEls) {
    avgVolumeEl.innerHTML = avgVolume
  }
}

async function requestData(ticker) {
  const api = "stonkscraper.heroku.com"
  const url = `${api}/ticker`

  const response = await fetch(url)
}

searchButton.onclick = (event) => {
  event.preventDefault()

  // console.log(searchInput.value)

  updateCompanyBubble("AMC", "AMC Corp")
  updatePriceBubble(5, -100, -50)
  updateStatsBubble(1, 1, 1, 1, 1, 1)
}
