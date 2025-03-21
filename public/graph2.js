document.addEventListener("DOMContentLoaded", function () {
    var chartContainer = document.getElementById("chart2");

    if (!chartContainer) {
        console.error("Element with id 'chart2' not found!");
        return;
    }

    var myChart = echarts.init(chartContainer);

    $.getJSON(
        'https://echarts.apache.org/examples/data/asset/data/echarts-package-size.json',
        function (data) {
            if (!data || !data.children) {
                console.error("Invalid data format received!", data);
                return;
            }

            const treemapOption = {
                series: [
                    {
                        type: 'treemap',
                        id: 'echarts-package-size',
                        animationDurationUpdate: 1000,
                        roam: false,
                        nodeClick: undefined,
                        data: data.children,
                        universalTransition: true,
                        label: { show: true },
                        breadcrumb: { show: false }
                    }
                ]
            };

            const sunburstOption = {
                series: [
                    {
                        type: 'sunburst',
                        id: 'echarts-package-size',
                        radius: ['20%', '90%'],
                        animationDurationUpdate: 1000,
                        nodeClick: undefined,
                        data: data.children,
                        universalTransition: true,
                        itemStyle: {
                            borderWidth: 1,
                            borderColor: 'rgba(255,255,255,.5)'
                        },
                        label: { show: false }
                    }
                ]
            };

            let currentOption = treemapOption;
            myChart.setOption(currentOption);

            setInterval(function () {
                myChart.clear();
                currentOption =
                    currentOption === treemapOption ? sunburstOption : treemapOption;
                myChart.setOption(currentOption);
            }, 3000);
        }
    ).fail(function (jqXHR, textStatus, errorThrown) {
        console.error("Failed to load JSON data:", textStatus, errorThrown);
    });
});
