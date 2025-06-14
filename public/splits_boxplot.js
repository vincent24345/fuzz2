  (function () {
  const bugData = {
    FW18: [13332, 14194, 43933, 18727, 72802, 25936, 19989, 33958],
    CNCFP01: [83123],
    FW11: [10559, 10719, 8464, 46419, 26180, 13793, 33184]
  };

  function getBoxPlotData(values) {
    const hours = values.map(v => v / 3600); // convert seconds to hours
    const sorted = [...hours].sort((a, b) => a - b);
    const q1 = quantile(sorted, 0.25);
    const median = quantile(sorted, 0.5);
    const q3 = quantile(sorted, 0.75);
    const min = sorted[0];
    const max = sorted[sorted.length - 1];
    return [min, q1, median, q3, max];
  }

  function quantile(arr, q) {
    const pos = (arr.length - 1) * q;
    const base = Math.floor(pos);
    const rest = pos - base;
    if (arr[base + 1] !== undefined) {
      return arr[base] + rest * (arr[base + 1] - arr[base]);
    } else {
      return arr[base];
    }
  }

  document.addEventListener('DOMContentLoaded', function () {
    const bugIds = Object.keys(bugData);
    const rows = bugIds.map(id => [id, ...getBoxPlotData(bugData[id])]);

    const chart = echarts.init(document.getElementById('splits-box-chart'));

    const option = {
      title: {
        text: 'Time Distribution by Bug ID (Box Plot)',
        left: 'center'
      },
      tooltip: {
        trigger: 'item',
        formatter: function (param) {
          return `
            <b>${param.name}</b><br/>
            Min: ${param.data[1].toFixed(2)}h<br/>
            Q1: ${param.data[2].toFixed(2)}h<br/>
            Median: ${param.data[3].toFixed(2)}h<br/>
            Q3: ${param.data[4].toFixed(2)}h<br/>
            Max: ${param.data[5].toFixed(2)}h
          `;
        }
      },
      toolbox: {
        show: true,
        feature: {
          saveAsImage: { title: 'Save' },
          restore: { title: 'Reset' }
        }
      },
      dataset: {
        source: [
          ['Bug ID', 'min', 'Q1', 'median', 'Q3', 'max'],
          ...rows
        ]
      },
      xAxis: {
        type: 'category',
        name: 'Bug ID',
        nameLocation: 'middle',
        nameGap: 25
      },
      yAxis: {
        type: 'value',
        name: 'Time (triggered in hours)',
        nameLocation: 'middle',
        nameGap: 40
      },
      series: [
        {
          name: 'Coverage',
          type: 'boxplot',
          encode: {
            x: 'Bug ID',
            y: ['min', 'Q1', 'median', 'Q3', 'max']
          }
        }
      ]
    };

    chart.setOption(option);

    chart.on('click', function (params) {
      alert(`You clicked on ${params.name}\nMedian value: ${params.data[3].toFixed(2)} hours`);
    });
  });
})();
