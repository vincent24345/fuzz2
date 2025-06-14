#!/usr/bin/env python3
import json
from datetime import datetime

def analyze_coverage_data(filename='cov-info-output-01.csv'):
    timestamps = []
    total_blocks_list = []

    try:
        with open(filename, 'r') as file:
            header = file.readline().strip()
            previous_total = 0

            for line in file:
                line = line.strip()
                if not line:
                    continue

                parts = line.split('\t') if '\t' in line else line.split(',')
                if len(parts) < 2:
                    continue

                try:
                    timestamp = int(parts[0])
                    total_blocks = int(parts[1])
                    # Convert timestamp from seconds to hours (float with 2 decimal places)
                    timestamps.append(round(timestamp / 3600, 2))
                    total_blocks_list.append(total_blocks)
                    previous_total = total_blocks
                except ValueError:
                    continue

        if timestamps and total_blocks_list:
            print(f"Generating interactive HTML chart with {len(timestamps)} data points...")
            generate_echarts_html(timestamps, total_blocks_list)
        else:
            print("No valid data for visualization.")

    except FileNotFoundError:
        print(f"Error: File '{filename}' not found.")
    except Exception as e:
        print(f"Error processing file: {e}")

def generate_echarts_html(timestamps, total_blocks):
    html_template = f"""
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Interactive Code Coverage</title>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/echarts/5.4.3/echarts.min.js"></script>
    <style>
        body {{ font-family: sans-serif; padding: 20px; }}
        #main {{ width: 100%; height: 600px; }}
    </style>
</head>
<body>
    <h2>Code Coverage Growth Over Time</h2>
    <div id="main"></div>
    <script>
        const chartDom = document.getElementById('main');
        const myChart = echarts.init(chartDom);

        const option = {{
            title: {{
                text: 'Code Coverage Growth',
                left: 'center'
            }},
            tooltip: {{
                trigger: 'axis'
            }},
            xAxis: {{
                type: 'category',
                name: 'Time (hours)',
                data: {json.dumps(timestamps)}
            }},
            yAxis: {{
                type: 'value',
                name: 'Total Code Blocks'
            }},
            series: [{{
                name: 'Total Blocks',
                type: 'line',
                smooth: true,
                symbol: 'circle',
                data: {json.dumps(total_blocks)},
                lineStyle: {{
                    width: 3
                }},
                itemStyle: {{
                    color: '#2E8B57'
                }}
            }}]
        }};

        myChart.setOption(option);
    </script>
</body>
</html>
"""
    output_file = f"coverage_chart_{datetime.now().strftime('%Y%m%d_%H%M%S')}.html"
    with open(output_file, 'w') as f:
        f.write(html_template)

    print(f"Interactive chart saved as: {output_file}")

if __name__ == "__main__":
    print("Generating ECharts HTML for Coverage Data")
    analyze_coverage_data()
