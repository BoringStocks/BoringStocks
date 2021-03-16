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

// MARK: - Elements

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

// MARK: - Update Functions

function updateTabTitle({ symbol, current, points_change: { percent, points }, market_status }) {
  if (market_status === 1) {
    if (Math.sign(points) === 1) {
      tabTitle.innerHTML = `${symbol} | 
      ${current.toFixed(2)} | 
      +${points.toFixed(2)} 
      (+${percent.toFixed(2)}%)`
    } else {
      tabTitle.innerHTML = `${symbol} | 
      ${current.toFixed(2)} | 
      ${points.toFixed(2)} 
      (${percent.toFixed(2)}%)`
    }
  } else {
    tabTitle.innerHTML = `${symbol} | ${current.toFixed(2)} | At Market Close`
  }
}

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

function updatePriceContainer({ current, points_change: { percent, points }, market_status }) {
  const needsAnimationRefresh = currentPriceEls[0].innerHTML != current
  for (let currentPriceEl of currentPriceEls) {
    currentPriceEl.innerHTML = current.toFixed(2)
  }

  const isPositive = points >= 0
  for (let priceChangeEl of priceChangeEls) {
    if (market_status === 1) {
      // Market Open
      if (isPositive) {
        priceChangeEl.innerHTML = `+${points.toFixed(2)} (+${percent.toFixed(2)}%)`
        priceChangeEl.style.color = greenColor
      } else {
        priceChangeEl.innerHTML = `${points.toFixed(2)} (${percent.toFixed(2)}%)`
        priceChangeEl.style.color = redColor
      }
    } else if (market_status === 1) {
      // Market Closed
      priceChangeEl.innerHTML = `At Market Close`
      priceChangeEl.style.color = secondaryLabel
    } else {
      priceChangeEl.innerHTML = `No Price`
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

// Update High and Low based on current stock price and previous HTML values
function updateHighAndLow({ current }) {
  const currentHigh = parseFloat(highEls[0].innerHTML)
  const currentLow = parseFloat(lowEls[0].innerHTML)

  if (current < currentLow) {
    for (let lowEl of lowEls) {
      lowEl.innerHTML = current.toFixed(2)
    }
  } else if (current > currentHigh) {
    for (let highEl of highEls) {
      highEl.innerHTML = current.toFixed(2)
    }
  }
}

// MARK: - Set Global Loading State

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

// MARK: - Set Error State

function setErrorState() {
  const errorPayload = {
    avg_volume: "Ø",
    current: 0,
    market_cap: "Ø",
    market_status: -1, // signify error
    name: "Couldn't load this stock",
    open: 0,
    points_change: {
      percent: "",
      points: "",
    },
    range: {
      close: "Ø",
      date: "",
      high: 0,
      low: 0,
    },
    symbol: "Error",
    timestamp: "23:18:34",
    volume: "Ø",
  }

  updateCompanyContainer(errorPayload)
  updatePriceContainer(errorPayload)
  updateStatsContainer(errorPayload)
  updateTabTitle(errorPayload)
}

// MARK: - Refresh Logic

function refresh(ticker) {
  clearInterval(refreshStock)
  setLoadingState(true)
  updateChartContainer("")

  requestAllData(ticker).then(() => {
    // Update current ticker
    localStorage.setItem(tickerKey, ticker)
    // Disable loading state
    setLoadingState(false)
    // Update Chart
    updateChartContainer("5_days")
  })

  // Auto refresh stock price
  refreshStock = setInterval(function () {
    requestCurrentPrice(ticker)
  }, 5000)
}

async function requestCurrentPrice(ticker) {
  const url = `${api}/${ticker}/current`

  await fetch(url)
    .then((response) => response.json())
    .then((result) => {
      updatePriceContainer(result)
      updateHighAndLow(result)
      updateTabTitle(result)
    })
}

async function requestAllData(ticker) {
  const url = `${api}/${ticker}`

  await fetch(url)
    .then((response) => response.json())
    .then((result) => {
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

// MARK: - Search Button handler

searchButton.onclick = (event) => {
  event.preventDefault()
  const ticker = searchInput.value
  searchInput.value = ""
  refresh(ticker)
}

// MARK: - Custom key binding for search bar

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

// MARK: - Initial page load

document.addEventListener("DOMContentLoaded", function () {
  setLoadingState(false)
  setErrorState()
  // refresh(defaultTicker)
})
