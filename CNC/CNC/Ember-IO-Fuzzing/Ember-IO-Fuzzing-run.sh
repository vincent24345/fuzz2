#!/bin/bash
sleep $4
if [[ ! -f $EMBER_BASE_DIR/AFLplusplus/afl-fuzz ]]; then
  echo "Environment variable EMBER_BASE_DIR not set correctly? Exiting"
  exit
fi

time_duration=$1
trial_name=$2
output=$3

setsid $EMBER_BASE_DIR/AFLplusplus/afl-fuzz -i ./seeds -o "fuzz_out" -t 200 -Q ./CNC.elf -sram_size 192k -flash_size 2048k -machine embedded_fuzz -fuzz_input @@ &

ember_pid=$!
sleep $1
kill -- -"$ember_pid"

# Function to check and kill the process if it exceeds 60 seconds
kill_process() {
    local pid=$1
    # Check if the process is still running after the initial sleep
    if ps -p "$pid" > /dev/null; then
        # Start a counter for the 60-second check
        for ((i=0; i<60; i++)); do
            sleep 1
            # Check if the process is still running
            if ps -p "$pid" > /dev/null; then
                exit 0
            fi
        done
        # If the process is still running after 60 seconds, send SIGKILL
        echo "Process $pid has been running for 60 seconds. Sending SIGKILL."
        kill -9 "$pid"
    fi
}

# Call the kill_process function to manage process termination
kill_process "$ember_pid"