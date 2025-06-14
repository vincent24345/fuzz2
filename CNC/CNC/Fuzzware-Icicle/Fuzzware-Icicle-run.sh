#!/bin/bash
time_duration=$1
trial_name=$2
output=$3

sleep $4

source virtualenvwrapper.sh
f=$(ls *.elf)
arm-none-eabi-objcopy -O binary "$f" "${f%.elf}.bin"

workon fuzzware-icicle

setsid AFL_COMPCOV_LEVEL=1 fuzzware pipeline -p "fuzz_out" --base-inputs ./seeds &

icicle_pid=$!
sleep $1
kill -- -"$icicle_pid"

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
kill_process "$icicle_pid"


