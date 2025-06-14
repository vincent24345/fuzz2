#!/bin/bash
time_duration=$1
trial_name=$2
output=$3

sleep $4

source virtualenvwrapper.sh
workon semu

# Define the path to the semu_config.yml file
config_file="semu_config.yml"

# Get the actual value of $HOME
home_dir="$HOME"

# Check if the config file exists
if [ -f "$config_file" ]; then
  # Use sed to replace $HOME with the actual home directory path
  sed -i "s|\$HOME|$home_dir|g" "$config_file"
  echo "Replaced \$HOME with $home_dir in $config_file"
else
  echo "Config file $config_file not found."
  exit 1
fi

afl-fuzz -V "$time_duration" -U -m none -i ../seeds -o . -t 10000 -- semu-fuzz @@ semu_config.yml 