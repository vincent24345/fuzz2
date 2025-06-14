from flask import Flask, jsonify
from survival_plots import process_binary
import glob
import os

app = Flask(__name__)

@app.route("/api/survival_data")
def get_survival_data():
    json_files = glob.glob("data/*.json")
    all_data = {}
    for json_file in json_files:
        binary_data = process_binary(json_file)
        all_data[os.path.basename(json_file)] = binary_data
    return jsonify(all_data)

if __name__ == '__main__':
    app.run(debug=True)
