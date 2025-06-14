#!/usr/bin/env python3
"""
Code Coverage Block Analyzer
Analyzes code coverage data and shows total blocks growth over time.
"""
import matplotlib.pyplot as plt
from datetime import datetime

def analyze_coverage_data(filename='cov-info-output-01.csv'):
    """
    Analyze code coverage data and show total blocks over time.
    """
    print("=== CODE COVERAGE ANALYSIS ===\n")
    
    # Lists to store data for plotting
    timestamps = []
    total_blocks_list = []
    
    try:
        with open(filename, 'r') as file:
            # Skip the header line
            header = file.readline().strip()
            print(f"Processing file: {filename}")
            print(f"Header: {header}\n")
            
            previous_total = 0
            
            for line in file:
                line = line.strip()
                if not line:
                    continue
                
                # Parse the line - handle both CSV and TSV formats
                if '\t' in line:
                    parts = line.split('\t')  # Tab-separated
                else:
                    parts = line.split(',')   # Comma-separated
                
                if len(parts) < 2:
                    continue
                
                try:
                    timestamp = int(parts[0])
                    total_blocks = int(parts[1])
                    
                    # Store all data points for plotting
                    timestamps.append(timestamp)
                    total_blocks_list.append(total_blocks)
                    
                    # Only print when there's an increase in total blocks
                    if total_blocks > previous_total:
                        blocks_added = total_blocks - previous_total
                        print(f"Time: {timestamp}s | Total blocks: {total_blocks} | New blocks: +{blocks_added}")
                        previous_total = total_blocks
                        
                except ValueError:
                    print(f"Skipping invalid line: {line}")
                    continue
        
        # Generate the line graph
        if timestamps and total_blocks_list:
            print(f"\nGenerating line graph with {len(timestamps)} data points...")
            create_coverage_graph(timestamps, total_blocks_list, filename)
        else:
            print("No valid data found for plotting.")
    
    except FileNotFoundError:
        print(f"Error: File '{filename}' not found.")
        print("Make sure your CSV file is in the same directory as this script.")
        return
    except Exception as e:
        print(f"Error processing file: {e}")
        return

def create_coverage_graph(timestamps, total_blocks, filename):
    """
    Create and save a line graph of code coverage over time (in hours).
    """
    plt.figure(figsize=(12, 8))
    
    # Convert seconds to hours
    hours = [ts / 3600 for ts in timestamps]

    # Create the line plot
    plt.plot(hours, total_blocks, linewidth=2, color='#2E8B57', marker='o', markersize=3)
    
    # Customize the graph
    plt.title('Code Coverage Growth Over Time', fontsize=16, fontweight='bold', pad=20)
    plt.xlabel('Time (hours)', fontsize=12)  # <-- updated axis label
    plt.ylabel('Total Code Blocks Discovered', fontsize=12)
    
    plt.grid(True, alpha=0.3, linestyle='--')
    plt.ticklabel_format(style='plain', axis='y')

    # Add stats (adjusted for hours)
    max_blocks = max(total_blocks)
    min_blocks = min(total_blocks)
    growth = max_blocks - min_blocks
    time_range_hrs = (max(timestamps) - min(timestamps)) / 3600

    stats_text = f'Max Blocks: {max_blocks:,}\nTime Range: {time_range_hrs:.2f} hrs\nGrowth: +{growth:,} blocks'
    plt.text(0.02, 0.98, stats_text, transform=plt.gca().transAxes, 
             bbox=dict(boxstyle='round', facecolor='lightgray', alpha=0.8),
             verticalalignment='top', fontsize=10)
    
    plt.tight_layout()

    graph_filename = f"coverage_graph_{datetime.now().strftime('%Y%m%d_%H%M%S')}.png"
    plt.savefig(graph_filename, dpi=300, bbox_inches='tight')
    print(f"Graph saved as: {graph_filename}")
    
    plt.show()
    return graph_filename


if __name__ == "__main__":
    print("Code Coverage Block Analyzer")
    print("=" * 50)
    
    # Analyze the coverage data file
    analyze_coverage_data()
    
    print("\n" + "=" * 50)
    print("Analysis complete!")