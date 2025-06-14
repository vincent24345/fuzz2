(function () {
  const bugDataRaw = {
  E01: [2040, 5797, 2443, 8895, 2230, 7468, 4331, 1761, 6507, 4407],
  FW12: [452, 250, 619, 456, 735, 719, 346, 1595, 311, 546],
  FW23: [1767, 1693, 1113, 1121, 697, 1055, 1050, 1130, 539, 1020],
  GATFP01: [149, 153, 155, 158, 163, 150, 157, 158, null, null],
  GATFP02: [3534, 2631, 4758, 8169, 1855, 1324, 2665, 3936, 2715, 1209],
  GATFP03: [6075, 19774, 15997, 11018, 4097, 19535, 48380, null, 5380, 2815],
  GATFP04: [3461, 2552, 4746, 6236, 1847, 1327, 2206, 2483, 2690, 2225],
  GATFP05: [32203, null, null, null, 26776, null, null, null, 14342, null],
  GATFP06: [null, 5449, 6852, null, 5415, 3849, 2884, null, 5218, 3580],
  MF01: [3013, 3139, 5529, 7369, 2577, 1104, 2755, 4831, 3168, 2345],
};
  // Convert seconds to hours
  const bugData = {};
  for (const key in bugDataRaw) {
    bugData[key] = bugDataRaw[key].map(seconds => seconds / 3600);
  }

  function getBoxPlotData(values) {
    if (!values.length) return [0, 0, 0, 0, 0]; // handle empty
    const sorted = [...values].sort((a, b) => a - b);
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

  function renderBoxPlot(containerId) {
    const bugIds = Object.keys(bugData);
    const rows = bugIds.map(id => [id, ...getBoxPlotData(bugData[id])]);

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
      dataZoom: [
        { type: 'slider', xAxisIndex: 0 },
        { type: 'inside', xAxisIndex: 0 }
      ],
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

    const chart = echarts.init(document.getElementById(containerId));
    chart.setOption(option);

    chart.on('click', function (params) {
      alert(`You clicked on ${params.name}\nMedian value: ${params.data[3].toFixed(2)} hours`);
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    renderBoxPlot('hoedur_gateway_boxplot');
  });
})();
