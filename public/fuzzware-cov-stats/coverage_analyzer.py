#!/usr/bin/env python3
"""
Code Coverage Block Analyzer
Analyzes code coverage data and shows total blocks growth over time.
"""

def analyze_coverage_data(filename='cov-info-output-05.csv'):
    """
    Analyze code coverage data and show total blocks over time.
    """
    print("=== CODE COVERAGE ANALYSIS ===\n")
    
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
                    
                    # Only print when there's an increase in total blocks
                    if total_blocks > previous_total:
                        blocks_added = total_blocks - previous_total
                        print(f"Time: {timestamp}s | Total blocks: {total_blocks} | New blocks: +{blocks_added}")
                        previous_total = total_blocks
                        
                except ValueError:
                    print(f"Skipping invalid line: {line}")
                    continue
    
    except FileNotFoundError:
        print(f"Error: File '{filename}' not found.")
        print("Make sure your CSV file is in the same directory as this script.")
        return
    except Exception as e:
        print(f"Error processing file: {e}")
        return

if __name__ == "__main__":
    print("Code Coverage Block Analyzer")
    print("=" * 50)
    
    # Analyze the coverage data file
    analyze_coverage_data()
    
    print("\n" + "=" * 50)
    print("Analysis complete!")