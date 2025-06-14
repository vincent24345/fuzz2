(function () {
    const bugData = {
      FW11: {
        runs: [1, 4, 5, 6, 7, 9, 10],
        coverage: [10559, 10719, 8464, 46419, 26180, 13793, 33184]
      },
      FW18: {
        runs: [2, 3, 4, 5, 6, 7, 9, 10],
        coverage: [13332, 14194, 43933, 18727, 72802, 25936, 19989, 33958]
      },
      CNCFP01: {
        runs: [4],
        coverage: [83123]
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
        legend: {
          data: Object.keys(bugData),
          selectedMode: 'true', left: 'right' 
        },
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
      renderCoverageChart('splits-chart'); 
    });
  })();
  