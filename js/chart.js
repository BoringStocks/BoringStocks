import { api, greenColor, redColor, secondaryLabel } from "./constants.js"

const ctx = document.getElementById("myChart").getContext("2d")

const gridStyles = {
  drawBorder: false,
  drawOnChartArea: false,
  drawTicks: false,
}

function getYAxes(stepSize) {
  return [
    {
      ticks: {
        fontColor: secondaryLabel,
        fontSize: 16,
        stepSize: 4,
        padding: 10,
        stepSize: stepSize,
      },
      gridLines: gridStyles,
    },
  ]
}

const xAxes = [
  {
    ticks: {
      fontColor: secondaryLabel,
      fontSize: 16,
      padding: 10,
    },
    gridLines: gridStyles,
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
      legend: {
        display: false,
      },
      animation: {
        duration: 0,
      },
      scales: {
        yAxes: getYAxes(stepSize),
        xAxes: xAxes,
      },
    },
  })
}
