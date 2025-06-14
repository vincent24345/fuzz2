(function () {
    const triggeredData = {
      FW11: 2.68,
      FW18: 6.49,
      CNCFP01: 12.54
    };
  
    const reachedData = {
      FW11: 2.49,
      FW18: 0.28,
      CNCFP01: 0.38
    };
  
    const bugIDs = Object.keys(triggeredData);
  
    const chart = echarts.init(document.getElementById('fuzz-median-chart'));
  
    const getSeries = (triggered, reached) => [
      {
        name: 'Reached', // <-- Reached now comes first
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
        name: 'Triggered', // <-- Triggered is now second (right)
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
        data: ['Reached', 'Triggered'] // Keep this matching the series order
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
  