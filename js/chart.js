import { api, greenColor, redColor, secondaryLabel, tickerKey } from "./constants.js"
import { formatTime } from './utils.js'

// MARK: - Elements

const desktopChartEl = document.getElementById("desktopChart")
const mobileChartEl = document.getElementById("mobileChart")

let desktopChart
let mobileChart

const oneDayButtonEls = document.getElementsByClassName("1DButton")
const fiveDaysButtonEls = document.getElementsByClassName("5DButton")
const threeMonthsButtonEls = document.getElementsByClassName("3MButton")
const oneYearButtonEls = document.getElementsByClassName("1YButton")
const fiveYearsButtonEls = document.getElementsByClassName("5YButton")

const chartErrorEls = document.getElementsByClassName("chartError")

// MARK: - Styling

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

const options = {
  layout: layout,
  maintainAspectRatio: false,
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
    bodyAlign: "center",
    titleAlign: "center",
    displayColors: false,
    titleFontSize: 14,
    bodyFontSize: 14,
  },
  hover: {
    mode: "nearest",
    intersect: true,
  },
}

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

// MARK: - Create Chart

function createChart() {
  const dates = []
  const points = []
  desktopChart = new Chart(desktopChartEl.getContext("2d"), {
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
        },
      ],
    },
    options: options,
  })
  mobileChart = new Chart(mobileChartEl.getContext("2d"), {
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
    options: options,
  })
}

// MARK: - Remove Chart

function removeChartData() {
  // git blame: chartjs for this extremly high DRY code
  // Update mobile chart
  mobileChart.data.datasets.pop()
  mobileChart.update()

  // Update desktop chart
  desktopChart.data.datasets.pop()
  desktopChart.update()
}

// MARK: - Update Chart

function updateChart(data, duration) {
  // Disable Error State
  setChartErrorState(false)

  // normalize data
  let dates = []
  let points = []
  let months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
  for (let point of data) {
    let formattedDate = ""
    const dateToFormat = new Date(point.date)

    // If the selected duration is 1D, use formatTime utility function to return time of the point.
    if (duration === "1_day") {
      let hours = dateToFormat.getHours()
      let minutes = dateToFormat.getMinutes()
      formattedDate = formatTime(hours, minutes)
    } else {
      formattedDate += dateToFormat.getDate() + " "
      formattedDate += months[dateToFormat.getMonth()] + ", "
      formattedDate += dateToFormat.getFullYear()
    }

    dates.push(formattedDate)
    points.push(point.close)
  }

  // compute line color
  const firstPoint = parseFloat(points[0])
  const lastPoint = parseFloat(points[points.length - 1])
  const lineColor = firstPoint < lastPoint ? greenColor : redColor

  // git blame: chartjs for this extremly high DRY code
  // Update mobile chart
  mobileChart.data.labels = dates
  mobileChart.data.datasets.pop()
  mobileChart.data.datasets.push(getDatasetObject(points, lineColor))
  mobileChart.update()

  // Update desktop chart
  desktopChart.data.labels = dates
  desktopChart.data.datasets.pop()
  desktopChart.data.datasets.push(getDatasetObject(points, lineColor))
  desktopChart.update()
}

// MARK: - Set Error State

function setChartErrorState(isError = true) {
  if (isError) {
    removeChartData()
    updateButtonEls(lastButtonPressedEls, enableButton)
  }

  desktopChartEl.style.display = isError ? "none" : "block"
  mobileChartEl.style.display = isError ? "none" : "block"

  for (let chartErrorEl of chartErrorEls) {
    chartErrorEl.style.display = isError ? "flex" : "none"
  }
}

// MARK: - Refresh Logic

let lastButtonPressedEls = []
async function requestChartData(duration) {
  const ticker = localStorage.getItem(tickerKey)
  const url = `${api}/${ticker}/historical/${duration}`

  await fetch(url)
    .then((response) => response.json())
    .then((result) => {
      updateButtonEls(lastButtonPressedEls, disableButton)
      updateChart(result.historical, duration)
    })
    .catch((error) => {
      console.log(error)

      // Handle Error
      setChartErrorState()
    })
}

// MARK: - Buttons Logic

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
    case "1_day":
      updateButtonEls(lastButtonPressedEls, enableButton)
      updateButtonEls(oneDayButtonEls, disableButtonWithLoader)
      lastButtonPressedEls = oneDayButtonEls
      break
    case "5_days":
      updateButtonEls(lastButtonPressedEls, enableButton)
      updateButtonEls(fiveDaysButtonEls, disableButtonWithLoader)
      lastButtonPressedEls = fiveDaysButtonEls
      break
    case "3_months":
      updateButtonEls(lastButtonPressedEls, enableButton)
      updateButtonEls(threeMonthsButtonEls, disableButtonWithLoader)
      lastButtonPressedEls = threeMonthsButtonEls
      break
    case "1_year":
      updateButtonEls(lastButtonPressedEls, enableButton)
      updateButtonEls(oneYearButtonEls, disableButtonWithLoader)
      lastButtonPressedEls = oneYearButtonEls
      break
    case "5_years":
      updateButtonEls(lastButtonPressedEls, enableButton)
      updateButtonEls(fiveYearsButtonEls, disableButtonWithLoader)
      lastButtonPressedEls = fiveYearsButtonEls
      break
    default:
      updateButtonEls(lastButtonPressedEls, enableButton)
      removeChartData()
      return
  }

  requestChartData(duration)
}

updateButtonEls(oneDayButtonEls, (buttonEl) => {
  buttonEl.onclick = () => {
    updateChartContainer("1_day")
  }
})
updateButtonEls(fiveDaysButtonEls, (buttonEl) => {
  buttonEl.onclick = () => {
    updateChartContainer("5_days")
  }
})
updateButtonEls(threeMonthsButtonEls, (buttonEl) => {
  buttonEl.onclick = () => {
    updateChartContainer("3_months")
  }
})
updateButtonEls(oneYearButtonEls, (buttonEl) => {
  buttonEl.onclick = () => {
    updateChartContainer("1_year")
  }
})
updateButtonEls(fiveYearsButtonEls, (buttonEl) => {
  buttonEl.onclick = () => {
    updateChartContainer("5_years")
  }
})

// MARK: - Initial page load

createChart()
