(function () {
    const bugData = {
      FW18: {
        runs: [1, 4, 5, 7, 9, 10],
        coverage: [43490, 29129, 30678, 17450, 15710, 17619]
      },
      CNCFP01: {
        runs: [1, 2, 5],
        coverage: [46072, 45130, 22978]
      },
      FW11: {
        runs: [1, 6, 10],
        coverage: [2161, 12901, 9641]
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
      renderCoverageChart('fuzzware-chart');
    });
  })();
  