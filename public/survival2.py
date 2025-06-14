import json
import pandas as pd
import os
import argparse
from typing import List
from lifelines import KaplanMeierFitter
import warnings
import glob

def calc_survival_data(data: List[int], trial_time: int):
    data = [x / 3600 if x is not None else None for x in data]
    df = pd.DataFrame(data)
    T = df.fillna(trial_time)
    E = df.notnull()
    kmf = KaplanMeierFitter()
    kmf.fit(T, E)
    times = kmf.survival_function_.index.tolist()
    survival_probs = kmf.survival_function_['KM_estimate'].tolist()
    return times, survival_probs

def export_combined_html_plot(all_binary_data, binary_name, output_dir="survival_plots_html"):
    os.makedirs(output_dir, exist_ok=True)
    html_file = os.path.join(output_dir, f"{binary_name}_survival_plots.html")

    # Create JavaScript data for all bugs
    bug_data_js = {}
    for bug_id, curves in all_binary_data.items():
        bug_data_js[bug_id] = curves

    json_data = json.dumps(bug_data_js)
    
    # Count total number of plots to determine layout
    total_plots = len(all_binary_data)

    html_template = f"""
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Survival Plots - {binary_name}</title>
    <script src="https://cdn.plot.ly/plotly-latest.min.js"></script>
    <style>
        body {{
            font-family: 'Segoe UI', Tahoma, sans-serif;
            margin: 30px;
        }}
        h2 {{
            text-align: center;
            margin-bottom: 20px;
        }}
        .plots-container {{
            display: flex;
            flex-direction: column;
            gap: 20px;
            align-items: center;
        }}
        .plot-row {{
            display: flex;
            gap: 20px;
            justify-content: center;
            flex-wrap: nowrap;
        }}
        .plot-container {{
            width: 600px;
            flex-shrink: 0;
        }}
        .plot-box {{
            width: 100%;
            height: 600px;
        }}
        /* Single plot centered */
        .single-plot {{
            justify-content: center;
        }}
    </style>
</head>
<body>
    <h2>Survivability Graph: {binary_name}</h2>
    <div class="plots-container" id="plotsContainer"></div>
    
    <script>
        const allData = {json_data};
        const totalPlots = Object.keys(allData).length;
        const plotsContainer = document.getElementById('plotsContainer');
        
        function createPlot(bugId, bugData, container) {{
            // Create container for this plot
            const plotContainer = document.createElement('div');
            plotContainer.className = 'plot-container';
            
            const plotDiv = document.createElement('div');
            plotDiv.className = 'plot-box';
            plotDiv.id = `plot-${{bugId}}`;
            
            plotContainer.appendChild(plotDiv);
            container.appendChild(plotContainer);
            
            // Create traces for this bug
            const traces = bugData.map(entry => {{
                return {{
                    x: entry.time,
                    y: entry.survival,
                    mode: 'lines+markers',
                    name: entry.fuzzer,
                    line: {{ 
                        width: 4,
                        shape: 'hv'
                    }},
                    marker: {{ size: 4 }}
                }};
            }});
            
            const layout = {{
                title: `Survival Curve for Bug ${{bugId}}`,
                xaxis: {{
                    title: 'Time (hrs)',
                    range: [0, Math.max(...bugData.flatMap(d => d.time)) * 1.05],
                    gridcolor: '#ddd'
                }},
                yaxis: {{
                    title: 'Survival Probability',
                    range: [0, 1.05],
                    gridcolor: '#ddd'
                }},
                legend: {{
                    orientation: 'h',
                    y: -0.2,
                    xanchor: 'center',
                    x: 0.5
                }},
                margin: {{ t: 60, b: 90, l: 80, r: 30 }},
                plot_bgcolor: 'white',
                paper_bgcolor: 'white',
                hovermode: 'closest'
            }};
            
            Plotly.newPlot(plotDiv.id, traces, layout, {{
                responsive: true,
                displayModeBar: true,
                displaylogo: false,
                modeBarButtonsToRemove: ['lasso2d', 'select2d', 'hoverClosestCartesian', 'hoverCompareCartesian', 'toggleSpikelines', 'zoom2d']
            }});
        }}
        
        function createRowLayout(plotEntries) {{
            const rows = [];
            
            if (totalPlots === 1) {{
                // 1 plot: single centered plot, no additional rows
                const row = document.createElement('div');
                row.className = 'plot-row single-plot';
                rows.push({{ element: row, plots: plotEntries }});
            }} else if (totalPlots === 2) {{
                // 2 plots: both in one row
                const row = document.createElement('div');
                row.className = 'plot-row';
                rows.push({{ element: row, plots: plotEntries }});
            }} else if (totalPlots === 3) {{
                // 3 plots: 2 in first row, 1 centered in second row
                const row1 = document.createElement('div');
                row1.className = 'plot-row';
                const row2 = document.createElement('div');
                row2.className = 'plot-row single-plot';
                
                rows.push({{ element: row1, plots: plotEntries.slice(0, 2) }});
                rows.push({{ element: row2, plots: plotEntries.slice(2, 3) }});
            }} else if (totalPlots === 4) {{
                // 4 plots: 2 in first row, 2 in second row
                const row1 = document.createElement('div');
                row1.className = 'plot-row';
                const row2 = document.createElement('div');
                row2.className = 'plot-row';
                
                rows.push({{ element: row1, plots: plotEntries.slice(0, 2) }});
                rows.push({{ element: row2, plots: plotEntries.slice(2, 4) }});
            }} else if (totalPlots === 5) {{
                // 5 plots: 2 in first row, 2 in second row, 1 centered in third row
                const row1 = document.createElement('div');
                row1.className = 'plot-row';
                const row2 = document.createElement('div');
                row2.className = 'plot-row';
                const row3 = document.createElement('div');
                row3.className = 'plot-row single-plot';
                
                rows.push({{ element: row1, plots: plotEntries.slice(0, 2) }});
                rows.push({{ element: row2, plots: plotEntries.slice(2, 4) }});
                rows.push({{ element: row3, plots: plotEntries.slice(4, 5) }});
            }} else if (totalPlots === 6) {{
                // 6 plots: 2 per row across 3 rows
                const row1 = document.createElement('div');
                row1.className = 'plot-row';
                const row2 = document.createElement('div');
                row2.className = 'plot-row';
                const row3 = document.createElement('div');
                row3.className = 'plot-row';
                
                rows.push({{ element: row1, plots: plotEntries.slice(0, 2) }});
                rows.push({{ element: row2, plots: plotEntries.slice(2, 4) }});
                rows.push({{ element: row3, plots: plotEntries.slice(4, 6) }});
            }} else {{
                // 7+ plots: 2 per row
                let plotIndex = 0;
                while (plotIndex < plotEntries.length) {{
                    const row = document.createElement('div');
                    row.className = 'plot-row';
                    const plotsForRow = plotEntries.slice(plotIndex, plotIndex + 2);
                    rows.push({{ element: row, plots: plotsForRow }});
                    plotIndex += 2;
                }}
            }}
            
            return rows;
        }}
        
        // Create all plots with proper layout
        const plotEntries = Object.entries(allData);
        const rows = createRowLayout(plotEntries);
        
        rows.forEach(rowInfo => {{
            plotsContainer.appendChild(rowInfo.element);
            rowInfo.plots.forEach(([bugId, bugData]) => {{
                createPlot(bugId, bugData, rowInfo.element);
            }});
        }});
    </script>
</body>
</html>
"""
    with open(html_file, "w") as f:
        f.write(html_template)
    print(f"✅ {binary_name}_survival_plots.html saved in {output_dir}")

def process_data(json_data):
    bug_survival_data = {}
    for run_name, run_data in json_data.get("Campaign", {}).items():
        for bug in run_data:
            if isinstance(bug, dict) and "bug_id" in bug:
                bug_id = bug["bug_id"]
                if bug_id not in bug_survival_data:
                    bug_survival_data[bug_id] = {"triggered": []}
                bug_survival_data[bug_id]["triggered"].append(bug["triggered"])
    return bug_survival_data

def survival_plot(json_files, output_dir="survival_plots_html"):
    warnings.simplefilter('ignore')
    all_data = {}

    for json_file in json_files:
        try:
            with open(json_file, "r") as file:
                json_data = json.load(file)
                fuzzer = json_data["Fuzzer"]
                binary = json_data["Target"]
                
                # Convert Trial-Time to float, handling both string and numeric types
                trial_time_raw = json_data["Trial-Time"]
                if isinstance(trial_time_raw, str):
                    trial_time = float(trial_time_raw) / 3600
                else:
                    trial_time = trial_time_raw / 3600
                
                bug_data = process_data(json_data)

                if binary not in all_data:
                    all_data[binary] = {}

                for bug_id, triggers in bug_data.items():
                    if bug_id not in all_data[binary]:
                        all_data[binary][bug_id] = []

                    times, surv = calc_survival_data(triggers["triggered"], trial_time)
                    all_data[binary][bug_id].append({
                        "fuzzer": fuzzer,
                        "time": times,
                        "survival": surv
                    })
        except (ValueError, TypeError) as e:
            print(f"Error processing {json_file}: Trial-Time conversion failed - {e}")
            continue
        except KeyError as e:
            print(f"Error processing {json_file}: Missing key - {e}")
            continue

    # Export one combined HTML file per binary
    for binary, bugs in all_data.items():
        export_combined_html_plot(bugs, binary, output_dir)

def main():
    parser = argparse.ArgumentParser(description="Generate per-bug interactive survival plots.")
    parser.add_argument("json_folder", help="Path to folder of JSON files")
    args = parser.parse_args()
    json_files = glob.glob(os.path.join(args.json_folder, "*.json"))
    json_files = [os.path.abspath(file) for file in json_files]
    survival_plot(json_files)

if __name__ == "__main__":
    main()