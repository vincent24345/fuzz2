(function () {
    const bugData = {
      FW11: {
        runs: [0, 1, 2, 3, 4, 5, 6, 8, 9],
        coverage: [23739, 3532, 2716, 4508, 18781, 2131, 10969, 5484, 24840]
      },
      FW18: {
        runs: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
        coverage: [597, 1839, 2404, 1979, 7897, 2908, 2774, 871, 400, 1800]
      },
      CNCFP01: {
        runs: [1, 5, 8],
        coverage: [14902, 51667, 28131]
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
          min: 0,
          max: 9,
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
      renderCoverageChart('multifuzz-chart'); 
    });
  })();
  