const tickerIndexEls = document.getElementsByClassName("tickerIndex")
const companyNameEls = document.getElementsByClassName("companyName")

const priceContainerEls = document.getElementsByClassName("priceContainer")
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

const greenColor = "#32D74B"
const redColor = "#FF453A"

function updateCompanyBubble({ ticker, name }) {
  for (tickerIndexEl of tickerIndexEls) {
    tickerIndexEl.innerHTML = ticker
  }
  for (companyNameEl of companyNameEls) {
    companyNameEl.innerHTML = name
  }
}

function updatePriceBubble({ current, points_change: { percent, points } }) {
  for (currentPriceEl of currentPriceEls) {
    currentPriceEl.innerHTML = current
  }

  const isPositive = points >= 0
  const color = isPositive ? greenColor : redColor
  for (priceChangeEl of priceChangeEls) {
    priceChangeEl.innerHTML = `${points} (${percent}%)`
    priceChangeEl.style.color = color
  }

  const index = document.body.clientWidth <= 992 ? 1 : 0
  const animation = isPositive ? "greenPriceUpdate" : "redPriceUpdate"
  priceContainerEls[index].classList.remove(animation)
  setTimeout(function () {
    priceContainerEls[index].classList.add(animation)
  }, 0)
}

function updateStatsBubble({ open, high, low, close, volume, avg_volume }) {
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
    avgVolumeEl.innerHTML = avg_volume
  }
}

let refreshStock
function refresh(ticker) {
  clearInterval(refreshStock)
  refreshStock = setInterval(function () {
    requestData(ticker)
  }, 2000)
}

async function requestData(ticker) {
  const api = "https://stonkscraper.herokuapp.com"
  const url = `${api}/${ticker}`

  await fetch(url)
    .then((response) => response.json())
    .then((result) => {
      result.ticker = ticker.toUpperCase()
      result.avg_volume = result["avg volume"]
      result.high = 1
      result.low = 1
      result.close = 1

      updateCompanyBubble(result)
      updatePriceBubble(result)
      updateStatsBubble(result)
    })

    .catch((err) => {
      console.log(err)
    })
}

searchButton.onclick = (event) => {
  event.preventDefault()

  requestData(searchInput.value)
  refresh(searchInput.value)
}
