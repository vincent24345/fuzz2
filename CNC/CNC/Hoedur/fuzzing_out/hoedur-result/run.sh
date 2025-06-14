#!/bin/bash

# Initialize the report number
report_number=1

# Iterate over files starting with "output-"
for file in output-*; do
    # Check if the file exists
    if [ -f "$file" ]; then
        # Extract the base name without "output-" prefix
        base_name="${file#output-}"
        
        # Run hoedur-dict-arm with the required parameters, including the incremented report number
        hoedur-dict-arm --import-config "$file" run-cov "report-$(printf "%02d" $report_number)" "$file" &
        #hoedur-extractor "report-$(printf "%02d" $report_number)" &
        # Increment the report number for the next file
        ((report_number++))
    fi
done

wait