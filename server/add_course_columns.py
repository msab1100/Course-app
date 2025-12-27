#!/usr/bin/env python3
import pymysql

try:
    conn = pymysql.connect(host='localhost', user='root', db='example_db')
    cur = conn.cursor()
    cur.execute("ALTER TABLE courses ADD COLUMN instructor VARCHAR(255) DEFAULT ''")
    cur.execute("ALTER TABLE courses ADD COLUMN category VARCHAR(100) DEFAULT ''")
    cur.execute("ALTER TABLE courses ADD COLUMN level VARCHAR(50) DEFAULT ''")
    conn.commit()
    print("Added instructor, category, level columns to courses table")
except Exception as e:
    print(f"Error: {e}")
finally:
    conn.close()
