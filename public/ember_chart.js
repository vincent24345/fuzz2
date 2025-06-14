(function () {
  const bugData = {
    FW18: {
      runs: [1, 2, 3, 4, 5, 6, 8, 9],
      coverage: [2550, 20128, 74832, 58092, 23663, 28958, 73913, 47991]
    },
    CNCFP01: {
      runs: [1, 9],
      coverage: [3257, 60313]
    },
    FW11: {
      runs: [5, 7],
      coverage: [56813, 56703]
    }
  };

  function renderCoverageChart(containerId) {
    const series = Object.keys(bugData).map(bugId => ({
      name: bugId,
      type: 'line',
      data: bugData[bugId].runs.map((run, i) => [run, bugData[bugId].coverage[i]])
    }));

    const option = {
      title: { text: 'Coverage Over Runs by Bug ID' },
      tooltip: { trigger: 'axis' },
      legend: { data: Object.keys(bugData), left: 'right' },
      xAxis: {
        type: 'value',
        name: 'Run',
        min: 1,
        max: 10,
        interval: 1
      },
      yAxis: {
        type: 'value',
        name: 'Coverage (triggered)'
      },
      series: series
    };

    const chart = echarts.init(document.getElementById(containerId));
    chart.setOption(option);
  }

  document.addEventListener('DOMContentLoaded', function () {
    renderCoverageChart('ember-chart');
  });
})();
