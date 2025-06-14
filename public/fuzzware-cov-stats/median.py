#!/usr/bin/env python3
import json
import glob
import statistics
from datetime import datetime
from collections import defaultdict

def analyze_multiple_coverage_files(file_pattern='cov-info-output-*.csv'):
    """Analyze multiple CSV files and calculate median, min, max for each timestamp"""
    all_data = defaultdict(list)  # timestamp -> list of total_blocks values
    file_count = 0
    
    # Find all matching CSV files
    csv_files = glob.glob(file_pattern)
    if not csv_files:
        print(f"No files found matching pattern: {file_pattern}")
        return
    
    print(f"Found {len(csv_files)} CSV files to analyze...")
    
    # Process each CSV file
    for filename in csv_files:
        print(f"Processing: {filename}")
        try:
            with open(filename, 'r') as file:
                header = file.readline().strip()
                
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
                        
                        # Apply different sampling rates based on time
                        if timestamp < 18000:  # Before 5 hours (5 * 3600 = 18000 seconds)
                            # Keep original sampling rate
                            timestamp_hours = round(timestamp / 3600, 2)
                            all_data[timestamp_hours].append(total_blocks)
                        else:
                            # After 5 hours, sample every 1000 seconds
                            if timestamp % 1000 == 0:  # Only keep data points at 1000-second intervals
                                timestamp_hours = round(timestamp / 3600, 2)
                                all_data[timestamp_hours].append(total_blocks)
                    except ValueError:
                        continue
            
            file_count += 1
        except FileNotFoundError:
            print(f"Warning: File '{filename}' not found.")
        except Exception as e:
            print(f"Error processing file '{filename}': {e}")
    
    if not all_data:
        print("No valid data found in any files.")
        return
    
    # Calculate statistics for each timestamp
    timestamps = sorted(all_data.keys())
    medians = []
    minimums = []
    maximums = []
    
    for timestamp in timestamps:
        values = all_data[timestamp]
        if values:
            medians.append(statistics.median(values))
            minimums.append(min(values))
            maximums.append(max(values))
        else:
            medians.append(0)
            minimums.append(0)
            maximums.append(0)
    
    print(f"Processed {file_count} files with {len(timestamps)} unique timestamps")
    print(f"Generating enhanced interactive HTML chart...")
    
    generate_enhanced_echarts_html(timestamps, medians, minimums, maximums, file_count)

def generate_enhanced_echarts_html(timestamps, medians, minimums, maximums, file_count):
    """Generate enhanced ECharts HTML with median, min/max area, zoom, and save functionality"""
    
    html_template = f"""
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Multi-File Code Coverage Analysis</title>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/echarts/5.4.3/echarts.min.js"></script>
    <style>
        body {{ 
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
            padding: 20px; 
            background-color: #f5f5f5;
        }}
        .container {{
            background: white;
            border-radius: 8px;
            padding: 20px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }}
        #main {{ 
            width: 100%; 
            height: 700px; 
            margin: 20px 0;
        }}
        .stats {{
            display: flex;
            justify-content: space-around;
            margin: 20px 0;
            padding: 15px;
            background: #f8f9fa;
            border-radius: 5px;
        }}
        .stat-item {{
            text-align: center;
        }}
        .stat-value {{
            font-size: 24px;
            font-weight: bold;
            color: #2E8B57;
        }}
        .stat-label {{
            font-size: 14px;
            color: #666;
            margin-top: 5px;
        }}
        .controls {{
            margin: 20px 0;
            text-align: center;
        }}
        .btn {{
            background: #2E8B57;
            color: white;
            border: none;
            padding: 10px 20px;
            border-radius: 5px;
            cursor: pointer;
            margin: 0 10px;
            font-size: 14px;
        }}
        .btn:hover {{
            background: #236B47;
        }}
        h1 {{
            text-align: center;
            color: #333;
            margin-bottom: 10px;
        }}
        .subtitle {{
            text-align: center;
            color: #666;
            margin-bottom: 20px;
        }}
    </style>
</head>
<body>
    <div class="container">
        <h1>Multi-File Code Coverage Analysis</h1>
        <div class="subtitle">Analysis of {file_count} CSV files</div>
        
        <div class="stats">
            <div class="stat-item">
                <div class="stat-value">{len(timestamps)}</div>
                <div class="stat-label">Data Points</div>
            </div>
            <div class="stat-item">
                <div class="stat-value">{file_count}</div>
                <div class="stat-label">Files Analyzed</div>
            </div>
            <div class="stat-item">
                <div class="stat-value">{max(medians) if medians else 0}</div>
                <div class="stat-label">Peak Coverage</div>
            </div>
            <div class="stat-item">
                <div class="stat-value">{round(max(timestamps) if timestamps else 0, 1)}h</div>
                <div class="stat-label">Duration</div>
            </div>
        </div>
        
        <div class="controls">
            <button class="btn" onclick="resetZoom()">Reset Zoom</button>
            <button class="btn" onclick="saveAsImage()">Save as PNG</button>
            <button class="btn" onclick="toggleDataZoom()">Toggle Data Zoom</button>
        </div>
        
        <div id="main"></div>
    </div>

    <script>
        const chartDom = document.getElementById('main');
        const myChart = echarts.init(chartDom);
        let dataZoomEnabled = true;

        const option = {{
            title: {{
                text: 'Code Coverage Growth Over Time',
                subtext: 'Median with Min/Max Range ({file_count} files)',
                left: 'center',
                textStyle: {{
                    fontSize: 18,
                    color: '#333'
                }},
                subtextStyle: {{
                    fontSize: 14,
                    color: '#666'
                }}
            }},
            tooltip: {{
                trigger: 'axis',
                backgroundColor: 'rgba(50,50,50,0.9)',
                borderColor: '#2E8B57',
                borderWidth: 1,
                textStyle: {{
                    color: '#fff'
                }},
                formatter: function(params) {{
                    let result = '<b>' + params[0].axisValue + ' hours</b><br/>';
                    params.forEach(function(item) {{
                        result += item.marker + ' ' + item.seriesName + ': ' + 
                                 item.value.toLocaleString() + '<br/>';
                    }});
                    return result;
                }}
            }},
            legend: {{
                data: ['Min-Max Range', 'Median Coverage'],
                top: 40,
                textStyle: {{
                    fontSize: 12
                }}
            }},
            grid: {{
                left: '3%',
                right: '4%',
                bottom: '15%',
                containLabel: true
            }},
            toolbox: {{
                show: false
            }},
            xAxis: {{
                type: 'category',
                name: 'Time (hours)',
                nameLocation: 'middle',
                nameGap: 25,
                data: {json.dumps(timestamps)},
                axisLine: {{
                    lineStyle: {{
                        color: '#666'
                    }}
                }},
                axisTick: {{
                    alignWithLabel: true
                }}
            }},
            yAxis: {{
                type: 'value',
                name: 'Total Code Blocks',
                nameLocation: 'middle',
                nameGap: 40,
                axisLine: {{
                    lineStyle: {{
                        color: '#666'
                    }}
                }},
                splitLine: {{
                    lineStyle: {{
                        type: 'dashed',
                        color: '#ddd'
                    }}
                }}
            }},
            dataZoom: [
                {{
                    type: 'inside',
                    start: 0,
                    end: 100
                }},
                {{
                    start: 0,
                    end: 100,
                    height: 30,
                    bottom: 30
                }}
            ],
            series: [
                {{
                    name: 'Min-Max Range',
                    type: 'line',
                    data: {json.dumps([[i, minimums[i]] for i in range(len(minimums))])},
                    lineStyle: {{ opacity: 0 }},
                    stack: 'range',
                    symbol: 'none',
                    areaStyle: {{
                        color: 'rgba(46, 139, 87, 0.15)'
                    }}
                }},
                {{
                    name: 'Max Range',
                    type: 'line',
                    data: {json.dumps([[i, maximums[i] - minimums[i]] for i in range(len(maximums))])},
                    lineStyle: {{ opacity: 0 }},
                    stack: 'range',
                    symbol: 'none',
                    areaStyle: {{
                        color: 'rgba(46, 139, 87, 0.15)'
                    }},
                    tooltip: {{ show: false }}
                }},
                {{
                    name: 'Median Coverage',
                    type: 'line',
                    data: {json.dumps(medians)},
                    smooth: true,
                    symbol: 'circle',
                    symbolSize: 6,
                    lineStyle: {{
                        width: 3,
                        color: '#2E8B57'
                    }},
                    itemStyle: {{
                        color: '#2E8B57',
                        borderColor: '#fff',
                        borderWidth: 2
                    }},
                    emphasis: {{
                        itemStyle: {{
                            shadowBlur: 10,
                            shadowColor: 'rgba(46, 139, 87, 0.5)'
                        }}
                    }}
                }}
            ]
        }};

        myChart.setOption(option);

        // Resize chart when window is resized
        window.addEventListener('resize', function() {{
            myChart.resize();
        }});

        // Control functions
        function resetZoom() {{
            myChart.dispatchAction({{
                type: 'dataZoom',
                start: 0,
                end: 100
            }});
        }}

        function saveAsImage() {{
            const url = myChart.getDataURL({{
                pixelRatio: 2,
                backgroundColor: '#fff'
            }});
            const link = document.createElement('a');
            link.download = 'coverage_analysis_' + new Date().toISOString().slice(0,19).replace(/:/g, '-') + '.png';
            link.href = url;
            link.click();
        }}

        function toggleDataZoom() {{
            dataZoomEnabled = !dataZoomEnabled;
            myChart.setOption({{
                dataZoom: dataZoomEnabled ? [
                    {{ type: 'inside', start: 0, end: 100 }},
                    {{ start: 0, end: 100, height: 30, bottom: 30 }}
                ] : []
            }});
        }}
    </script>
</body>
</html>
"""
    
    output_file = f"multi_coverage_analysis_{datetime.now().strftime('%Y%m%d_%H%M%S')}.html"
    with open(output_file, 'w') as f:
        f.write(html_template)
    
    print(f"Enhanced interactive chart saved as: {output_file}")
    print(f"Chart features:")
    print("- Median coverage line with min/max shaded area")
    print("- Adaptive sampling: full resolution <5hrs, 1000s intervals >5hrs")
    print("- Interactive zoom and pan")
    print("- Save as PNG functionality")
    print("- Data zoom controls")
    print("- Detailed tooltips with min/max values")

def analyze_single_file(filename='cov-info-output-01.csv'):
    """Fallback function for single file analysis"""
    timestamps = []
    total_blocks_list = []

    try:
        with open(filename, 'r') as file:
            header = file.readline().strip()

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
                    
                    # Apply different sampling rates based on time
                    if timestamp < 18000:  # Before 5 hours (5 * 3600 = 18000 seconds)
                        # Keep original sampling rate
                        timestamps.append(round(timestamp / 3600, 2))
                        total_blocks_list.append(total_blocks)
                    else:
                        # After 5 hours, sample every 1000 seconds
                        if timestamp % 1000 == 0:  # Only keep data points at 1000-second intervals
                            timestamps.append(round(timestamp / 3600, 2))
                            total_blocks_list.append(total_blocks)
                except ValueError:
                    continue

        if timestamps and total_blocks_list:
            print(f"Single file analysis: {len(timestamps)} data points")
            # For single file, use the same values for median, min, max
            generate_enhanced_echarts_html(timestamps, total_blocks_list, 
                                         total_blocks_list, total_blocks_list, 1)
        else:
            print("No valid data for visualization.")

    except FileNotFoundError:
        print(f"Error: File '{filename}' not found.")
    except Exception as e:
        print(f"Error processing file: {e}")

if __name__ == "__main__":
    print("Multi-File Coverage Analysis Tool")
    print("=" * 40)
    
    # Try to analyze multiple files first
    analyze_multiple_coverage_files()
    
    # If no files found, try single file analysis
    csv_files = glob.glob('cov-info-output-*.csv')
    if not csv_files:
        print("\nNo multi-file pattern found, trying single file analysis...")
        analyze_single_file()