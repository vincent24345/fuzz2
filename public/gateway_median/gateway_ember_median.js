(function () {
  const triggeredData = {
     E01: 5.84,
      FW12: 2.85,
      FW23	: 7.91,
      GATFP01: 0.01,
      GATFP02: 5.85,
      GATFP03: null,
      GATFP04: 5.85,
      GATFP05: null,
      GATFP06: null,
      MF01: 8.79
  };

  const reachedData = {
     E01: 1.54 ,
      FW12: 0.01,
      FW23	: 2.60,
      GATFP01: 0.00,
      GATFP02: 5.85,
      GATFP03: null,
      GATFP04: 5.85,
      GATFP05: null,
      GATFP06: null,
      MF01: 5.77
  };

  const bugIDs = Object.keys(triggeredData);

  const chart = echarts.init(document.getElementById('gateway_median_ember'));

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