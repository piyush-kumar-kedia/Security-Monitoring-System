import subprocess
import sys
import os
from dotenv import load_dotenv

load_dotenv()

DB_USER = os.getenv("DB_MAIN_USER")
DB_PASS = os.getenv("DB_MAIN_PASSWORD")
DB_HOST = os.getenv("DB_MAIN_HOST")
DB_PORT = os.getenv("DB_MAIN_PORT")

def run_python(script):
    print(f"\nRunning {script} ...")
    result = subprocess.run([sys.executable, script])
    if result.returncode != 0:
        print(f"Error running {script}")
        sys.exit(1)
    print(f"Finished {script}")

def run_psql(database, sql_file):
    print(f"\nExecuting {sql_file} on {database} ...")
    try:
        result = subprocess.run(
            [
                "psql",
                "-h", DB_HOST,
                "-p", DB_PORT,
                "-U", DB_USER,
                "-d", database,
                "-f", sql_file
            ],
            env={**os.environ, "PGPASSWORD": DB_PASS}
        )
        if result.returncode != 0:
            print(f"Failed running {sql_file} on {database}")
            sys.exit(1)
        print(f"Executed {sql_file} on {database}")
    except FileNotFoundError:
        print("psql command not found in PATH. Please install PostgreSQL client tools or add to PATH.")
        sys.exit(1)

def main():
    run_python("profile_preprocess.py")
    run_python("ingest_and_preprocess.py")
    run_psql("postgres", "create_tables.sql")
    print("\nEnsuring ethos_images database exists ...")
    subprocess.run(
        [
            "psql", "-h", DB_HOST, "-p", DB_PORT, "-U", DB_USER,
            "-d", "postgres", "-c", "CREATE DATABASE ethos_images;"
        ],
        env={**os.environ, "PGPASSWORD": DB_PASS}
    )
    run_psql("postgres", "create_images_table.sql")
    run_python("db_insert.py")
    run_python("ingest_face_images.py")
    run_python("run_create_indexes.py")

    print("\n Pipeline completed successfully!")

if __name__ == "__main__":
    main()
