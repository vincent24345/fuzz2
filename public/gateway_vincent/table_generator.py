import json
import os
import statistics
from pathlib import Path

def format_value(value):
    """Format value for display - show '–' for None/null values"""
    if value is None:
        return "–"
    return str(value)

def calculate_median(values):
    """Calculate median, handling None values"""
    filtered_values = [v for v in values if v is not None]
    if not filtered_values:
        return None
    return statistics.median(filtered_values)

def extract_bug_data(campaign_data):
    """Extract bug data from campaign, ignoring crash data"""
    bugs = {}
    
    for run_name, run_data in campaign_data.items():
        bugs[run_name] = {}
        
        for item in run_data:
            if isinstance(item, dict) and 'bug_id' in item:
                bug_id = item['bug_id']
                reached = item.get('reached')
                triggered = item.get('triggered')
                
                bugs[run_name][bug_id] = {
                    'reached': reached,
                    'triggered': triggered
                }
    
    return bugs

def get_all_bug_ids(bugs_data):
    """Get all unique bug IDs across all runs"""
    all_bug_ids = set()
    for run_data in bugs_data.values():
        all_bug_ids.update(run_data.keys())
    return sorted(list(all_bug_ids))

def generate_html_table(json_data):
    """Generate HTML table for a single JSON file"""
    fuzzer_name = json_data.get('Fuzzer', 'Unknown')
    target = json_data.get('Target', 'Unknown')
    num_trials = json_data.get('Number-Trials', 0)
    
    # Extract bug data from campaign
    campaign_data = json_data.get('Campaign', {})
    bugs_data = extract_bug_data(campaign_data)
    
    # Get all bug IDs
    all_bug_ids = get_all_bug_ids(bugs_data)
    
    if not all_bug_ids:
        return f"<p>No bug data found for {fuzzer_name} on {target}</p>"
    
    # Calculate medians
    medians = {}
    for bug_id in all_bug_ids:
        reached_values = []
        triggered_values = []
        
        for run_data in bugs_data.values():
            if bug_id in run_data:
                reached_values.append(run_data[bug_id]['reached'])
                triggered_values.append(run_data[bug_id]['triggered'])
            else:
                reached_values.append(None)
                triggered_values.append(None)
        
        medians[bug_id] = {
            'reached': calculate_median(reached_values),
            'triggered': calculate_median(triggered_values)
        }
    
    # Generate HTML
    table_id = f"{target.lower()}_{fuzzer_name.lower().replace('-', '_')}"
    
    html = f'''<!--table collapsible-->
<div class="fuzzing_table" id="splits_table_{table_id}"> 
  <button type="button" class="collapsible">Bugs Triggered {fuzzer_name} data</button>
  <section class="content">
    <h2>{fuzzer_name} Summary on {target} (Runs 1–{num_trials})</h2>
    <table>
      <thead>
        <tr>
          <th>Run</th>
          <th>Bug ID</th>
          <th>Reached</th>
          <th>Triggered</th>
        </tr>
      </thead>
      <tbody class="secondstohours">
'''
    
    # Add data rows
    run_names = sorted(bugs_data.keys())
    for i, run_name in enumerate(run_names):
        run_data = bugs_data[run_name]
        
        for j, bug_id in enumerate(all_bug_ids):
            if bug_id in run_data:
                reached = format_value(run_data[bug_id]['reached'])
                triggered = format_value(run_data[bug_id]['triggered'])
            else:
                reached = "–"
                triggered = "–"
            
            if j == 0:  # First bug ID for this run
                html += f'        <tr><td rowspan="{len(all_bug_ids)}">{run_name}</td><td>{bug_id}</td><td>{reached}</td><td>{triggered}</td></tr>\n'
            else:
                html += f'        <tr><td>{bug_id}</td><td>{reached}</td><td>{triggered}</td></tr>\n'
    
    # Add median row
    html += '\n        <!-- median table-->\n'
    for j, bug_id in enumerate(all_bug_ids):
        median_reached = format_value(medians[bug_id]['reached'])
        median_triggered = format_value(medians[bug_id]['triggered'])
        
        if j == 0:  # First bug ID for median
            html += f'        <tr><td rowspan="{len(all_bug_ids)}"><strong>Median</strong></td><td>{bug_id}</td><td>{median_reached}</td><td><strong>{median_triggered}</strong></td></tr>\n'
        else:
            html += f'        <tr><td>{bug_id}</td><td>{median_reached}</td><td><strong>{median_triggered}</strong></td></tr>\n'
    
    html += '''      </tbody>
    </table>
  </section>
</div>

'''
    
    return html

def process_json_files(directory_path="."):
    """Process all JSON files in the specified directory"""
    directory = Path(directory_path)
    html_output = ""
    
    # Find all JSON files
    json_files = list(directory.glob("*.json"))
    
    if not json_files:
        print("No JSON files found in the specified directory.")
        return
    
    for json_file in json_files:
        try:
            print(f"Processing {json_file.name}...")
            
            with open(json_file, 'r') as f:
                json_data = json.load(f)
            
            html_table = generate_html_table(json_data)
            html_output += html_table
            
        except Exception as e:
            print(f"Error processing {json_file.name}: {str(e)}")
            continue
    
    # Write to output file
    output_file = directory / "fuzzing_results.html"
    with open(output_file, 'w') as f:
        f.write(html_output)
    
    print(f"HTML output written to {output_file}")
    return html_output

def process_single_json(file_path):
    """Process a single JSON file"""
    try:
        with open(file_path, 'r') as f:
            json_data = json.load(f)
        
        html_table = generate_html_table(json_data)
        print(html_table)
        return html_table
        
    except Exception as e:
        print(f"Error processing {file_path}: {str(e)}")
        return None

# Example usage:
if __name__ == "__main__":
    # Process all JSON files in current directory
    process_json_files()
    
    # Or process a single file:
    # process_single_json("your_file.json")