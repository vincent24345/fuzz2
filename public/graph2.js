document.addEventListener("DOMContentLoaded", function(){
    var chart = echarts.init(document.getElementById("chart2"));
    
    var option = {
        tooltip: {
            trigger: 'axis',
            axisPointer: {
                type: 'shadow'
            }
        },
        grid: {
            left: '3%',
            right: '4%',
            bottom: '3%',
            containLabel: true
        },
        xAxis: [
            {
                type: 'category',
                data: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
                axisTick: {
                    alignWithLabel: true
                }
            }
        ],
        yAxis: [
            {
                type: 'value'
            }
        ],
        series: [
            {
                name: 'Direct',
                type: 'bar',
                barWidth: '60%',
                data: [10, 52, 200, 334, 390, 330, 220]
            }
        ],
        dataZoom: [
            {
                type: 'inside',  // Zoom via mouse wheel or drag
                xAxisIndex: 0
            },
            {
                type: 'slider',  // Optional slider for zooming
                xAxisIndex: 0,
                bottom: 0
            }
        ]
    };

    chart.setOption(option);

    //zoom functionality on click
    chart.on('click', function (params) {
        // Get the clicked x-axis value (position) and calculate the zoom level
        var xValue = params.name;  // xValue is the category name (e.g., 'Mon', 'Tue')
        var xData = option.xAxis[0].data;
        var currentIndex = xData.indexOf(xValue);

        // Determine the zoom range based on the clicked position
        var zoomRange = [Math.max(currentIndex - 2, 0), Math.min(currentIndex + 2, xData.length - 1)];

        // Update the dataZoom range dynamically
        chart.setOption({
            dataZoom: [
                {
                    type: 'inside',
                    start: (zoomRange[0] / xData.length) * 100,
                    end: (zoomRange[1] / xData.length) * 100
                }
            ]
        });
    });
});
