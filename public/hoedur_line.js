(function () {
    const bugData = {
      FW11: {
        runs: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
        coverage: [329, 637, 476, 524, 508, 441, 702, 372, 704, 612]
      },
      FW18: {
        runs: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
        coverage: [1333, 607, 615, 741, 1721, 460, 590, 868, 742, 1064]
      },
      CNCFP01: {
        runs: [4, 5, 7, 10],
        coverage: [2007, 4928, 18481, 23005]
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
      renderCoverageChart('hoedur-chart'); 
    });
  })();
  