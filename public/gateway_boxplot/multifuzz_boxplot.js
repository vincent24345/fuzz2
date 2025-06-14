(function () {
   const bugDataRaw = {
    E01: [51670, 0, 81886, 60680, 0, 19701, 12194, 0, 19016, 0],
    FW12: [277, 479, 336, 623, 237, 54, 586, 346, 235, 527],
    FW23: [1375, 3860, 12326, 8192, 0, 523, 12194, 6999, 0, 8412],
    GATFP01: [1, 0, 0, 0, 0, 1, 0, 0, 0, 0],
    GATFP02: [1492, 1670, 596, 906, 599, 2468, 1453, 1870, 946, 144],
    GATFP03: [1492, 1670, 596, 906, 599, 2468, 1453, 1870, 946, 144],
    GATFP04: [1492, 1670, 596, 906, 599, 2468, 1453, 1870, 946, 144],
    GATFP05: [null, null, 72750, null, 81394, null, null, null, null, null],
    GATFP06: [null, 73636, null, null, null, null, 80665, null, null, null],
    MF01: [7912, 435, 60, 140, null, 1729, 662, 800, 814, 512]
  };

  // Convert seconds to hours
  const bugData = {};
  for (const key in bugDataRaw) {
    bugData[key] = bugDataRaw[key].map(seconds => seconds / 3600);
  }

  function getBoxPlotData(values) {
    if (!values.length) return [0, 0, 0, 0, 0]; 
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
    renderBoxPlot('multifuzz_gateway_boxplot');
  });
})();
