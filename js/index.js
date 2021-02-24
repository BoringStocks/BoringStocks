import {
  api,
  greenColor,
  redColor,
  secondaryLabel,
  easterEggs,
  tickerKey,
  defaultTicker,
} from "./constants.js"
import { updateChartContainer } from "./chart.js"

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
const marketCapEls = document.getElementsByClassName("mktCap")

const searchForm = document.getElementById("formRoot")
const searchInput = document.getElementById("searchInput")
const searchButton = document.getElementById("searchButton")
const searchSpan = document.getElementById("searchSpan")
const loadingDiv = document.getElementById("loadingDiv")
const tabTitle = document.getElementById("tabTitle")

const shineEls = document.getElementsByClassName("rootContainer")
const containerEls = document.getElementsByClassName("informationContainer")

let loadingState = true
let refreshStock

function updateCompanyContainer({ symbol, name }) {
  let computedSymbol = symbol

  // Add easter egg 🐣
  if (symbol in easterEggs) {
    computedSymbol += " " + easterEggs[symbol]
  }

  for (let tickerIndexEl of tickerIndexEls) {
    tickerIndexEl.innerHTML = computedSymbol
  }
  for (let companyNameEl of companyNameEls) {
    companyNameEl.innerHTML = name
  }
}

function updateTabTitle({ symbol, current, points_change: { percent, points }, market_status }) {
  if (market_status === 1) {
    tabTitle.innerHTML = `${symbol} | 
    ${current.toFixed(2)} | 
    ${points.toFixed(2)} 
    (${percent.toFixed(2)}%)`
  } else {
    tabTitle.innerHTML = `${symbol} | ${current.toFixed(2)} | Market Closed`
  }
}

function updatePriceContainer({ current, points_change: { percent, points }, market_status }) {
  const needsAnimationRefresh = currentPriceEls[0].innerHTML != current
  for (let currentPriceEl of currentPriceEls) {
    currentPriceEl.innerHTML = current.toFixed(2)
  }

  const isPositive = points >= 0
  const color = isPositive ? greenColor : redColor
  for (let priceChangeEl of priceChangeEls) {
    if (market_status === 1) {
      // Market Open
      priceChangeEl.innerHTML = `${points.toFixed(2)} (${percent.toFixed(2)}%)`
      priceChangeEl.style.color = color
    } else {
      // Market Closed
      priceChangeEl.innerHTML = `Market Closed`
      priceChangeEl.style.color = secondaryLabel
    }
  }

  if (needsAnimationRefresh && market_status === 1) {
    const index = document.body.clientWidth <= 992 ? 1 : 0
    const animation = isPositive ? "greenPriceUpdate" : "redPriceUpdate"
    priceContainerEls[index].classList.remove("greenPriceUpdate")
    priceContainerEls[index].classList.remove("redPriceUpdate")
    setTimeout(function () {
      priceContainerEls[index].classList.add(animation)
    }, 0)
  }
}

function updateStatsContainer({ range: { high, low }, open, volume, avg_volume, market_cap }) {
  for (let openEl of openEls) {
    openEl.innerHTML = open.toFixed(2)
  }
  for (let highEl of highEls) {
    highEl.innerHTML = high.toFixed(2)
  }
  for (let lowEl of lowEls) {
    lowEl.innerHTML = low.toFixed(2)
  }
  for (let volumeEl of volumeEls) {
    volumeEl.innerHTML = volume.toLocaleString()
  }
  for (let avgVolumeEl of avgVolumeEls) {
    avgVolumeEl.innerHTML = avg_volume.toLocaleString()
  }
  for (let marketCapEl of marketCapEls) {
    marketCapEl.innerHTML = market_cap
  }
}

function setLoadingState(isLoading) {
  loadingState = isLoading

  searchButton.disabled = isLoading
  searchInput.disabled = isLoading

  searchSpan.style.display = isLoading ? "none" : "block"
  loadingDiv.style.display = isLoading ? "block" : "none"

  for (let shineEl of shineEls) {
    if (isLoading) {
      shineEl.classList.add("shine")
    } else {
      shineEl.classList.remove("shine")
    }
  }

  for (let containerEl of containerEls) {
    if (isLoading) {
      containerEl.classList.add("hide")
    } else {
      containerEl.classList.remove("hide")
    }
  }
}

function refresh(ticker) {
  clearInterval(refreshStock)
  setLoadingState(true)
  updateChartContainer("")
  requestData(ticker).then(() => {
    // Update current ticker
    localStorage.setItem(tickerKey, ticker)
    // Update Chart
    updateChartContainer("5_days")
  })
  refreshStock = setInterval(function () {
    requestData(ticker)
  }, 5000)
}

async function requestData(ticker) {
  const url = `${api}/${ticker}`

  await fetch(url)
    .then((response) => response.json())
    .then((result) => {
      // Disable shimmer loading state for background refresh
      const currentTicker = localStorage.getItem(tickerKey).toUpperCase()
      if (result.symbol === currentTicker && loadingState === true) {
        setLoadingState(false)
      }

      // Update all containers
      updateCompanyContainer(result)
      updatePriceContainer(result)
      updateStatsContainer(result)
      updateTabTitle(result)
    })

    .catch((err) => {
      console.log(err)
      setLoadingState(false)
      clearInterval(refreshStock)

      searchForm.classList.remove("shakeAnimation")
      setTimeout(function () {
        searchForm.classList.add("shakeAnimation")
      }, 0)
      // TODO: show error state
    })
}

// Search Button handler
searchButton.onclick = (event) => {
  event.preventDefault()
  const ticker = searchInput.value
  searchInput.value = ""
  refresh(ticker)
}

// Initial page load
document.addEventListener("DOMContentLoaded", function () {
  refresh(defaultTicker)
})

// Custom key binding for search bar
window.addEventListener(
  "keydown",
  function (event) {
    if (event.key === "/") {
      searchInput.focus()
      setTimeout(function () {
        searchInput.value = ""
      }, 0)
    }
  },
  true
)
