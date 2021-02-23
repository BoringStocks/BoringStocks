import { api, greenColor, redColor, secondaryLabel } from "./constants.js"

const tickerIndexEls = document.getElementsByClassName("tickerIndex")

const ctx = document.getElementById("myChart").getContext("2d")

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
    borderWidth: 4,
    fill: false,
    lineTension: 0.2, // Subject to change
    responsive: true,
    maintainAspectRatio: false,
    borderColor: [lineColor],
    pointBorderColor: lineColor,
  }
}

let actualChart
function createChart(data) {
  const dates = []
  const points = []

  actualChart = new Chart(ctx, {
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
    },
  })
}

function updateChart(data) {
  let dates = []
  let points = []
  for (let point of data) {
    dates.push(point.date.slice(6))
    points.push(point.close)
  }

  let lineColor = points[0] < points[points.length - 1] ? greenColor : redColor
  // let stepSize = Math.abs(points[0] - points[points.length - 1])

  actualChart.data.labels = dates
  actualChart.data.datasets.pop()
  actualChart.data.datasets.push(getDatasetObject(points, lineColor))

  actualChart.update()
}

let lastButtonPressedEls = []
async function requestChartData(duration) {
  const ticker = tickerIndexEls[0].innerHTML
  const url = `${api}/${ticker}/historical/${duration}`

  await fetch(url)
    .then((response) => response.json())
    .then((result) => {
      updateButtonEls(lastButtonPressedEls, enableButton)
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

function disableButton(buttonEl) {
  buttonEl.disabled = true
  buttonEl.querySelector(".label").style.display = "none"
  buttonEl.querySelector(".loader").style.display = null
}

export function updateChartContainer(duration) {
  // Disable all buttons
  // only show loader on btn pressed
  switch (duration) {
    case "5_days":
      updateButtonEls(fiveDaysButtonEls, disableButton)
      updateButtonEls(lastButtonPressedEls, enableButton)
      lastButtonPressedEls = fiveDaysButtonEls
      break
    case "1_month":
      updateButtonEls(lastButtonPressedEls, enableButton)
      updateButtonEls(oneMonthButtonEls, disableButton)
      lastButtonPressedEls = oneMonthButtonEls
      break
    case "6_months":
      updateButtonEls(lastButtonPressedEls, enableButton)
      updateButtonEls(sixMonthsButtonEls, disableButton)
      lastButtonPressedEls = sixMonthsButtonEls
      break
    case "1_year":
      updateButtonEls(lastButtonPressedEls, enableButton)
      updateButtonEls(oneYearButtonEls, disableButton)
      lastButtonPressedEls = oneYearButtonEls
      break
    default:
      updateButtonEls(lastButtonPressedEls, enableButton)
      updateButtonEls(maxButtonEls, disableButton)
      lastButtonPressedEls = maxButtonEls
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
