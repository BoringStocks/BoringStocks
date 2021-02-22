import { api, greenColor, redColor, secondaryLabel } from "./constants.js"

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

export function updateChartContainer(data) {
  console.log(data)

  let dates = []
  let points = []
  for (let point of data) {
    dates.push(point.date.slice(6))
    points.push(point.close)
  }

  let lineColor = points[0] < points[points.length - 1] ? greenColor : redColor
  let stepSize = Math.abs(points[0] - points[points.length - 1])

  new Chart(ctx, {
    type: "line",
    data: {
      labels: dates,
      datasets: [
        {
          label: "Price",
          data: points,
          borderColor: [lineColor],
          pointBorderColor: lineColor,
          borderWidth: 5,
          fill: false,
          lineTension: 0,
          responsive: true,
          maintainAspectRatio: false,
        },
      ],
    },
    options: {
      layout: {
        padding: {
          top: 8,
          right: 8,
          left: 8,
          bottom: 8,
        },
      },
      legend: {
        display: false,
      },
      animation: {
        duration: 0,
      },
      scales: {
        yAxes: xAxes,
        xAxes: xAxes,
      },
    },
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

let lastButtonPressedEls = []
function updateChartV2(duration) {
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
}

updateButtonEls(fiveDaysButtonEls, (buttonEl) => {
  buttonEl.onclick = () => {
    updateChartV2("5_days")
  }
})
updateButtonEls(oneMonthButtonEls, (buttonEl) => {
  buttonEl.onclick = () => {
    updateChartV2("1_month")
  }
})
updateButtonEls(sixMonthsButtonEls, (buttonEl) => {
  buttonEl.onclick = () => {
    updateChartV2("6_months")
  }
})
updateButtonEls(oneYearButtonEls, (buttonEl) => {
  buttonEl.onclick = () => {
    updateChartV2("1_year")
  }
})
updateButtonEls(maxButtonEls, (buttonEl) => {
  buttonEl.onclick = () => {
    updateChartV2("max")
  }
})
