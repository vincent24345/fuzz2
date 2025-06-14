(function () {
    const bugData = {
      FW18: {
        runs: [2, 3, 4, 5, 6, 7, 8, 9],
        coverage: [27618, 18528, 26541, 9149, 24732, 20962, 1734, 10145]
      },
      CNCFP01: {
        runs: [1, 9],
        coverage: [0, 0]
      },
      FW11: {
        runs: [3, 4, 5, 6, 10],
        coverage: [35159, 27625, 63367, 14235, 2537]
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
      renderCoverageChart('icicle-chart');
    });
  })();
  