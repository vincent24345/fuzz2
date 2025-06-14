(function () {
   const bugDataRaw = {
    E01: [74032, 81920], 
    FW12: [3376, 824, 3705, 1646, 2204, 4375, 3195, 2702],
    FW23: [81827, 19728, 46291, 13320],
    GATFP01: [61, 62, 62, 61, 61, 63, 61, 61, 60],
    GATFP02: [14610, 18028, 21733, 76977, 27271, 24484, 37138],
    GATFP03: [28903],
    GATFP04: [14578, 18255, 21157, 76967, 27264, 24487, 37130],
    GATFP05: [],
    GATFP06: [],
    MF01: [20287, 27944, 76904, 24608, 40354]
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
    renderBoxPlot('splits_gateway_boxplot');
  });
})();
