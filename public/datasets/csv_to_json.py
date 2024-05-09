import csv
import json
import sys

# Specify the CSV file to read from
input_csv_file = sys.argv[1] + ".csv"

# Specify the JSON file to write to
output_json_file = sys.argv[1] + ".json"

# Open the CSV file for reading
with open(input_csv_file, mode="r", newline="") as file:
    # Create a CSV reader object
    csv_reader = csv.reader(file)

    # Read the header (first row) from the CSV
    headers = next(csv_reader)

    # Initialize a list to store each row of data as a dictionary
    data = []

    # Iterate over the rest of the rows in the CSV file
    for row in csv_reader:
        # Create a dictionary for the current row, mapping header fields to row data
        row_data = {headers[i]: row[i] for i in range(len(headers))}
        # Append the dictionary to the data list
        data.append(row_data)

# Create the final dictionary to store the data in the required format
output_dict = {"headers": headers, "data": data}

# Open the JSON file for writing
with open(output_json_file, mode="w") as json_file:
    # Write the data to the JSON file, ensuring it is easy to read (pretty print)
    json.dump(output_dict, json_file, indent=4)

print(f"Data successfully written to {output_json_file}")
