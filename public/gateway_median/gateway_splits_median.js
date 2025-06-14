(function () {
  const triggeredData = {
    E01: 21.66,
    FW12: 0.82,
    FW23: 9.17,
    GATFP01: 0.02,
    GATFP02: 6.80,
    GATFP03: 8.03,
    GATFP04: 6.80,
    GATFP05: null,
    GATFP06: null,
    MF01: 7.76
  };

  const reachedData = {
    E01: 0.17,
    FW12: 0.00,
    FW23: 9.17,
    GATFP01: 0.00,
    GATFP02: 6.80,
    GATFP03: 7.69,
    GATFP04: 6.80,
    GATFP05: 6.92,
    GATFP06: null,
    MF01: 6.84
  };

  const bugIDs = Object.keys(triggeredData);

  const chart = echarts.init(document.getElementById('gateway_median_splits'));

  const getSeries = (triggered, reached) => [
    {
      name: 'Reached',
      type: 'bar',
      data: bugIDs.map(bug => reached[bug]),
      itemStyle: {
        color: '#2196f3'
      },
      emphasis: {
        itemStyle: {
          color: '#1565c0'
        },
        label: {
          show: true,
          position: 'top',
          fontWeight: 'bold',
          fontSize: 14,
          formatter: '{c}'
        }
      },
      animationDuration: 800
    },
    {
      name: 'Triggered',
      type: 'bar',
      data: bugIDs.map(bug => triggered[bug]),
      itemStyle: {
        color: '#4caf50'
      },
      emphasis: {
        itemStyle: {
          color: '#388e3c'
        },
        label: {
          show: true,
          position: 'top',
          fontWeight: 'bold',
          fontSize: 14,
          formatter: '{c}'
        }
      },
      animationDuration: 800
    }
  ];

  const option = {
    title: {
      text: 'Median Time by Bug ID',
      left: 'center'
    },
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'shadow'
      }
    },
    legend: {
      top: '10%',
      data: ['Reached', 'Triggered']
    },
    dataZoom: [
      {
        type: 'slider',
        start: 0,
        end: 100,
        xAxisIndex: 0
      }
    ],
    xAxis: {
      type: 'category',
      name: 'Bug ID',
      data: bugIDs,
      axisLabel: {
        fontSize: 14
      }
    },
    yAxis: {
      type: 'value',
      name: 'Median Time (hrs)',
      axisLabel: {
        fontSize: 14
      }
    },
    series: getSeries(triggeredData, reachedData)
  };

  chart.setOption(option);

  let focused = false;
  chart.on('click', function (params) {
    const clickedBug = params.name;

    if (!focused) {
      chart.setOption({
        xAxis: {
          data: [clickedBug]
        },
        series: getSeries(
          { [clickedBug]: triggeredData[clickedBug] },
          { [clickedBug]: reachedData[clickedBug] }
        )
      });
      focused = true;
    } else {
      chart.setOption({
        xAxis: {
          data: bugIDs
        },
        series: getSeries(triggeredData, reachedData)
      });
      focused = false;
    }
  });
})();