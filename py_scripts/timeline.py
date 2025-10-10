import psycopg2
from datetime import datetime
import dotenv
import os
from dotenv import load_dotenv

load_dotenv()


def get_timeline(name, department, start_time, end_time):
    """
    Retrieve timeline data for a person based on name, department and time range
    """
    try:
        # Connect to the database
        db_config = {
            'host': os.getenv("DB_MAIN_HOST"),
            'port': os.getenv("DB_MAIN_PORT"),
            'user': os.getenv("DB_MAIN_USER"),
            'password': os.getenv("DB_MAIN_PASSWORD"),
            'database': os.getenv("DB_MAIN_NAME")
        }
        conn = psycopg2.connect(**db_config)
    
        cursor = conn.cursor()

        # SQL query to get timeline data
        query = """
            SELECT p.name, p.department, d.timestamp, d.location, d.activity
            FROM person_details p
            JOIN detection_events d ON p.person_id = d.person_id
            WHERE p.name ILIKE %s 
            AND p.department ILIKE %s
            AND d.timestamp BETWEEN %s AND %s
            ORDER BY d.timestamp;
        """

        # Execute query with parameters
        cursor.execute(query, (f"%{name}%", f"%{department}%", start_time, end_time))
        results = cursor.fetchall()

        if not results:
            return "No timeline data found for the specified criteria"

        # Format the results
        timeline_data = []
        for row in results:
            timeline_entry = {
                'name': row[0],
                'department': row[1],
                'timestamp': row[2].strftime('%Y-%m-%d %H:%M:%S'),
                'location': row[3],
                'activity': row[4]
            }
            timeline_data.append(timeline_entry)

        return timeline_data

    except psycopg2.Error as e:
        return f"Database error: {str(e)}"
    finally:
        if 'conn' in locals():
            cursor.close()
            conn.close()

def main():
    # Get user input
    name = input("Enter name to search: ")
    department = input("Enter department: ")
    start_time = input("Enter start time (YYYY-MM-DD HH:MM:SS): ")
    end_time = input("Enter end time (YYYY-MM-DD HH:MM:SS): ")

    try:
        # Convert string dates to datetime objects
        start_dt = datetime.strptime(start_time, '%Y-%m-%d %H:%M:%S')
        end_dt = datetime.strptime(end_time, '%Y-%m-%d %H:%M:%S')

        # Get timeline data
        timeline_data = get_timeline(name, department, start_dt, end_dt)

        # Display results
        if isinstance(timeline_data, list):
            print("\nTimeline Results:")
            print("-" * 80)
            for entry in timeline_data:
                print(f"Time: {entry['timestamp']}")
                print(f"Name: {entry['name']}")
                print(f"Department: {entry['department']}")
                print(f"Location: {entry['location']}")
                print(f"Activity: {entry['activity']}")
                print("-" * 80)
        else:
            print(timeline_data)

    except ValueError as e:
        print(f"Error: Invalid date format. {str(e)}")

if __name__ == "__main__":
    main()