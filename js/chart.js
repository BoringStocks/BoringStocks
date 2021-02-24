import { api, greenColor, redColor, secondaryLabel, tickerKey } from "./constants.js"

const desktopChartEl = document.getElementById("desktopChart")
const mobileChartEl = document.getElementById("mobileChart")
let desktopChart
let mobileChart

const fiveDaysButtonEls = document.getElementsByClassName("5DButton")
const oneMonthButtonEls = document.getElementsByClassName("1MButton")
const sixMonthsButtonEls = document.getElementsByClassName("6MButton")
const oneYearButtonEls = document.getElementsByClassName("1YButton")
const maxButtonEls = document.getElementsByClassName("MAXButton")

const gridStyles = {
  drawBorder: false,
  drawOnChartArea: false,
  drawTicks: false,
}

const layout = {
  padding: {
    top: 8,
    right: 8,
    left: 8,
    bottom: 8,
  },
}

const yAxes = [
  {
    ticks: {
      fontColor: secondaryLabel,
      fontSize: 16,
      stepSize: 4,
      padding: 10,
    },
    gridLines: gridStyles,
    display: false,
  },
]

const xAxes = [
  {
    ticks: {
      fontColor: secondaryLabel,
      fontSize: 16,
      padding: 10,
    },
    gridLines: gridStyles,
    display: false,
  },
]

function getDatasetObject(data, lineColor) {
  return {
    data: data,
    borderWidth: 3,
    fill: false,
    lineTension: 0.01, // Subject to change
    responsive: true,
    maintainAspectRatio: false,
    borderColor: [lineColor],
    pointBorderColor: lineColor,
    borderCapStyle: "round",
  }
}

function createChart(data) {
  const dates = []
  const points = []
  const chartConfig = {
    type: "line",
    data: {
      labels: dates,
      datasets: [
        {
          label: "Price",
          data: points,
          borderWidth: 4,
          fill: false,
          lineTension: 0.2, // Subject to change
          responsive: true,
          maintainAspectRatio: false,
        },
      ],
    },
    options: {
      layout: layout,
      legend: {
        display: false,
      },
      animation: {
        duration: 1000,
      },
      scales: {
        yAxes: yAxes,
        xAxes: xAxes,
      },
      elements: {
        point: {
          radius: 0,
        },
      },
      tooltips: {
        mode: "index",
        intersect: false,
      },
      hover: {
        mode: "nearest",
        intersect: true,
      },
    },
  }

  desktopChart = new Chart(desktopChartEl.getContext("2d"), chartConfig)
  mobileChart = new Chart(mobileChartEl.getContext("2d"), chartConfig)
}

function removeChartData() {
  // git blame: chartjs for this extremly high DRY code
  if (document.body.clientWidth <= 992) {
    // Update mobile chart
    mobileChart.data.datasets.pop()
    mobileChart.update()
  } else {
    // Update desktop chart
    desktopChart.data.datasets.pop()
    desktopChart.update()
  }
}

function updateChart(data) {
  // normalize data
  let dates = []
  let points = []
  for (let point of data) {
    dates.push(point.date.slice(6))
    points.push(point.close)
  }

  // compute line color
  const lineColor = points[0] < points[points.length - 1] ? greenColor : redColor

  // git blame: chartjs for this extremly high DRY code
  if (document.body.clientWidth <= 992) {
    // Update mobile chart
    mobileChart.data.labels = dates
    mobileChart.data.datasets.pop()
    mobileChart.data.datasets.push(getDatasetObject(points, lineColor))
    mobileChart.update()
  } else {
    // Update desktop chart
    desktopChart.data.labels = dates
    desktopChart.data.datasets.pop()
    desktopChart.data.datasets.push(getDatasetObject(points, lineColor))
    desktopChart.update()
  }
}

let lastButtonPressedEls = []
async function requestChartData(duration) {
  const ticker = localStorage.getItem(tickerKey)
  const url = `${api}/${ticker}/historical/${duration}`

  await fetch(url)
    .then((response) => response.json())
    .then((result) => {
      updateButtonEls(lastButtonPressedEls, disableButton)
      updateChart(result.historical)
    })
    .catch((error) => {
      console.log(error)
      // TODO: show error state
    })
}

function updateButtonEls(buttonEls, updater) {
  for (let buttonEl of buttonEls) {
    updater(buttonEl)
  }
}

function enableButton(buttonEl) {
  buttonEl.disabled = false
  buttonEl.querySelector(".label").style.display = null
  buttonEl.querySelector(".loader").style.display = "none"
}

function disableButtonWithLoader(buttonEl) {
  buttonEl.disabled = true
  buttonEl.querySelector(".label").style.display = "none"
  buttonEl.querySelector(".loader").style.display = null
}

function disableButton(buttonEl) {
  buttonEl.disabled = true
  buttonEl.querySelector(".label").style.display = null
  buttonEl.querySelector(".loader").style.display = "none"
}

export function updateChartContainer(duration) {
  // Disable all buttons
  // only show loader on btn pressed
  switch (duration) {
    case "5_days":
      updateButtonEls(lastButtonPressedEls, enableButton)
      updateButtonEls(fiveDaysButtonEls, disableButtonWithLoader)
      lastButtonPressedEls = fiveDaysButtonEls
      break
    case "1_month":
      updateButtonEls(lastButtonPressedEls, enableButton)
      updateButtonEls(oneMonthButtonEls, disableButtonWithLoader)
      lastButtonPressedEls = oneMonthButtonEls
      break
    case "6_months":
      updateButtonEls(lastButtonPressedEls, enableButton)
      updateButtonEls(sixMonthsButtonEls, disableButtonWithLoader)
      lastButtonPressedEls = sixMonthsButtonEls
      break
    case "1_year":
      updateButtonEls(lastButtonPressedEls, enableButton)
      updateButtonEls(oneYearButtonEls, disableButtonWithLoader)
      lastButtonPressedEls = oneYearButtonEls
      break
    case "max":
      updateButtonEls(lastButtonPressedEls, enableButton)
      updateButtonEls(maxButtonEls, disableButtonWithLoader)
      lastButtonPressedEls = maxButtonEls
      break
    default:
      updateButtonEls(lastButtonPressedEls, enableButton)
      removeChartData()
      return
  }

  requestChartData(duration)
}

updateButtonEls(fiveDaysButtonEls, (buttonEl) => {
  buttonEl.onclick = () => {
    updateChartContainer("5_days")
  }
})
updateButtonEls(oneMonthButtonEls, (buttonEl) => {
  buttonEl.onclick = () => {
    updateChartContainer("1_month")
  }
})
updateButtonEls(sixMonthsButtonEls, (buttonEl) => {
  buttonEl.onclick = () => {
    updateChartContainer("6_months")
  }
})
updateButtonEls(oneYearButtonEls, (buttonEl) => {
  buttonEl.onclick = () => {
    updateChartContainer("1_year")
  }
})
updateButtonEls(maxButtonEls, (buttonEl) => {
  buttonEl.onclick = () => {
    updateChartContainer("max")
  }
})

createChart()
