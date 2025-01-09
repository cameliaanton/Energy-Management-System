import sys

import pika
import csv
import json
import time
from datetime import datetime, timedelta

# RabbitMQ configuration
RABBITMQ_HOST = 'localhost'
RABBITMQ_EXCHANGE = 'energy_data_exchange'
RABBITMQ_ROUTING_KEY = 'energy_data_routing_json_key'

# Establish connection with RabbitMQ
def connect_rabbitmq():
    connection = pika.BlockingConnection(pika.ConnectionParameters(RABBITMQ_HOST))
    channel = connection.channel()
    # Declare the exchange to match Spring Boot configuration
    channel.exchange_declare(exchange=RABBITMQ_EXCHANGE, exchange_type='topic', durable=True)
    return connection, channel

# Function to send data to RabbitMQ
def send_data_to_rabbitmq(channel, data):
    message = json.dumps(data)
    # Publish to the configured exchange and routing key
    channel.basic_publish(exchange=RABBITMQ_EXCHANGE, routing_key=RABBITMQ_ROUTING_KEY, body=message)
    print(f"Sent data: {message}")

# Function to process sensor data
def process_sensor_data(device_id,csv_file, start_date_str):
    connection, channel = connect_rabbitmq()

    # Parse the provided start date string
    current_datetime = datetime.strptime(start_date_str, "%Y-%m-%d %H:%M:%S")
    readings_per_hour = 6  # 6 readings per hour
    readings_counter = 0  # Counter for readings in the current hour

    try:
        with open(csv_file, 'r') as file:
            reader = csv.reader(file)
            next(reader)  # Skip header if present
            previous_value = None

            for row in reader:
                current_value = float(row[0])

                if previous_value is not None:
                    # Calculate consumption
                    consumption = current_value - previous_value

                    # Prepare data for RabbitMQ
                    timestamp = int(current_datetime.timestamp() * 1000)  # Convert to milliseconds
                    data = {
                        "timestamp": timestamp,
                        "deviceId": device_id,
                        "measurementValue": consumption
                    }

                    # Send data
                    send_data_to_rabbitmq(channel, data)

                    # Increment the counter and check if we need to advance the hour
                    readings_counter += 1
                    if readings_counter == readings_per_hour:
                        readings_counter = 0
                        current_datetime += timedelta(hours=1)  # Advance the hour

                        # Check for day transition
                        if current_datetime.hour == 0:
                            print(f"New day started: {current_datetime.strftime('%Y-%m-%d')}")

                        # Check for month transition
                        if current_datetime.day == 1 and current_datetime.hour == 0:
                            print(f"New month started: {current_datetime.strftime('%Y-%m')}")

                previous_value = current_value
                time.sleep(5)  # Sleep for 10 minutes (600 seconds in production)
    finally:
        connection.close()

# Run the script
if __name__ == "__main__":
    if len(sys.argv) != 2:
        print("Usage: python main.py <device_id>")
        sys.exit(1)
    csv_file = 'sensor.csv'
    start_date = "2024-12-10 09:00:00"  # Define your custom start date
    device_id=int(sys.argv[1])
    process_sensor_data(device_id, csv_file, start_date)
