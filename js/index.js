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

const greenColor = "#32D74B"
const redColor = "#FF453A"
const secondaryLabel = "rgba(255, 255, 255, 0.425)"

function updateCompanyContainer({ symbol, name }) {
  for (tickerIndexEl of tickerIndexEls) {
    tickerIndexEl.innerHTML = symbol
  }
  for (companyNameEl of companyNameEls) {
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
  for (currentPriceEl of currentPriceEls) {
    currentPriceEl.innerHTML = current.toFixed(2)
  }

  const isPositive = points >= 0
  const color = isPositive ? greenColor : redColor
  for (priceChangeEl of priceChangeEls) {
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
    volumeEl.innerHTML = volume.toLocaleString()
  }
  for (avgVolumeEl of avgVolumeEls) {
    avgVolumeEl.innerHTML = avg_volume.toLocaleString()
  }
  for (marketCapEl of marketCapEls) {
    marketCapEl.innerHTML = market_cap
  }
}

function updateStockGraph(data) {
  console.log(data)
  
  let dates = []
  let points = []
  for (point of data) {
    dates.push(point.date.slice(6))
    points.push(point.close)
  }

  let lineColor = points[0] < points[points.length - 1] ? greenColor : redColor
  let stepSize = Math.abs(points[0] - points[points.length - 1])

  let gridStyles = {
    drawBorder: false,
    drawOnChartArea: false,
    drawTicks: false
  }

  var ctx = document.getElementById('myChart').getContext('2d');
  var myChart = new Chart(ctx, {
      type: 'line',
      data: {
          labels: dates,
          datasets: [{
              label: 'Price',
              data: points,
              borderColor: [
                  lineColor
              ],
              pointBorderColor: lineColor,
              borderWidth: 5,
              fill: false,
              lineTension: 0,
              responsive: true,
              maintainAspectRatio: false
          }]
      },
      options: {
        legend: {
          display: false
        },
       animation: {
        duration: 0
        },
        scales: { 
          yAxes: [{
              ticks: {
                fontColor: secondaryLabel,
                fontSize: 16,
                stepSize: 4,
                padding: 10
              },
              gridLines: gridStyles,
          }],
          xAxes: [{
            ticks: {
              fontColor: secondaryLabel,
              fontSize: 16,
              padding: 10
            },
            gridLines: gridStyles,
        }],
      }
      }
  });
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
  const api = "https://api.boringstocks.live/v1"
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
      updateTabTitle(result)
      updateStockGraph(result.historical)
    })

    .catch((err) => {
      setLoadingState(false)
      clearInterval(refreshStock)

      searchForm.classList.remove("shakeAnimation")
      setTimeout(function () {
        searchForm.classList.add("shakeAnimation")
      }, 0)
    })
}

searchButton.onclick = (event) => {
  event.preventDefault()
  symbol = searchInput.value
  searchInput.value = ""

  refresh(symbol)
}

document.addEventListener("DOMContentLoaded", function () {
  refresh(symbol)
})

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
