const tickerIndexEls = document.getElementsByClassName("tickerIndex")
const companyNameEls = document.getElementsByClassName("companyName")

const priceContainerEls = document.getElementsByClassName("priceContainer")
const currentPriceEls = document.getElementsByClassName("currentPrice")
const priceChangeEls = document.getElementsByClassName("priceChange")

const openEls = document.getElementsByClassName("open")
const highEls = document.getElementsByClassName("high")
const lowEls = document.getElementsByClassName("low")
const volumeEls = document.getElementsByClassName("volume")
const avgVolumeEls = document.getElementsByClassName("avgVolume")

const searchInputEls = document.getElementsByClassName("searchInput")
const searchButtonEls = document.getElementsByClassName("searchButton")
const searchSpan = document.getElementById("searchSpan")
const loadingDiv = document.getElementById("loadingDiv")

const shineEls = document.getElementsByClassName("rootContainer")
const containerEls = document.getElementsByClassName("informationContainer")

const greenColor = "#32D74B"
const redColor = "#FF453A"

function updateCompanyContainer({ symbol, name }) {
  for (tickerIndexEl of tickerIndexEls) {
    tickerIndexEl.innerHTML = symbol
  }
  for (companyNameEl of companyNameEls) {
    companyNameEl.innerHTML = name
  }
}

function updatePriceContainer({ current, points_change: { percent, points } }) {
  const needsAnimationRefresh = currentPriceEls[0].innerHTML != current
  for (currentPriceEl of currentPriceEls) {
    currentPriceEl.innerHTML = current
  }

  const isPositive = points >= 0
  const color = isPositive ? greenColor : redColor
  for (priceChangeEl of priceChangeEls) {
    priceChangeEl.innerHTML = `${points} (${percent}%)`
    priceChangeEl.style.color = color
  }

  if (needsAnimationRefresh) {
    const index = document.body.clientWidth <= 992 ? 1 : 0
    const animation = isPositive ? "greenPriceUpdate" : "redPriceUpdate"
    priceContainerEls[index].classList.remove("greenPriceUpdate")
    priceContainerEls[index].classList.remove("redPriceUpdate")
    setTimeout(function () {
      priceContainerEls[index].classList.add(animation)
    }, 0)
  }
}

function updateStatsContainer({
  range: { close, high, low },
  open,
  volume,
  avg_volume,
}) {
  for (openEl of openEls) {
    openEl.innerHTML = open.toFixed(2)
  }
  for (highEl of highEls) {
    highEl.innerHTML = high.toFixed(2)
  }
  for (lowEl of lowEls) {
    lowEl.innerHTML = low.toFixed(2)
  }
  for (volumeEl of volumeEls) {
    volumeEl.innerHTML = volume
  }
  for (avgVolumeEl of avgVolumeEls) {
    avgVolumeEl.innerHTML = avg_volume
  }
}

function setLoadingState(isLoading) {
  searchButton.disabled = isLoading
  searchInput.disabled = isLoading

  searchSpan.style.display = isLoading ? "none" : "block"
  loadingDiv.style.display = isLoading ? "block" : "none"

  for (shineEl of shineEls) {
    if (isLoading) {
      shineEl.classList.add("shine")
    } else {
      shineEl.classList.remove("shine")
    }
  }

  for (containerEl of containerEls) {
    if (isLoading) {
      containerEl.classList.add("hide")
    } else {
      containerEl.classList.remove("hide")
    }
  }
}

let symbol = "GME"
let refreshStock
function refresh(ticker) {
  clearInterval(refreshStock)
  setLoadingState(true)

  requestData(ticker)
  refreshStock = setInterval(function () {
    requestData(ticker)
  }, 5000)
}

async function requestData(ticker) {
  const api = "https://stonkscraper.herokuapp.com"
  const url = `${api}/${ticker}`

  await fetch(url)
    .then((response) => response.json())
    .then((result) => {
      // Do not show loading state for background refresh
      if (result.symbol === symbol.toUpperCase()) {
        setLoadingState(false)
      }

      updateCompanyContainer(result)
      updatePriceContainer(result)
      updateStatsContainer(result)
    })

    .catch((err) => {
      setLoadingState(false)
      clearInterval(refreshStock)
      // TODO: update ui to reflect failed state
    })
}

searchButton.onclick = (event) => {
  event.preventDefault()
  symbol = searchInput.value

  refresh(symbol)
}

document.addEventListener("DOMContentLoaded", function () {
  refresh(symbol)
})
