const sqlite3 = require("sqlite3").verbose();

// Connect to SQLite database (creates database.db if it doesn't exist)
const db = new sqlite3.Database("database.db", (err) => {
  if (err) {
    return console.error("Error connecting to database:", err.message);
  }
  console.log("Connected to SQLite database.");
});

// Create tables
db.serialize(() => {
  db.run(
    `CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL
    )`,
    (err) => {
      if (err) {
        console.error("Error creating users table:", err.message);
      } else {
        console.log("Users table created successfully.");
      }
    }
  );

  db.run(
    `CREATE TABLE IF NOT EXISTS skills (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER,
        skill_name TEXT NOT NULL,
        experience_level TEXT,
        FOREIGN KEY (user_id) REFERENCES users(id)
    )`,
    (err) => {
      if (err) {
        console.error("Error creating skills table:", err.message);
      } else {
        console.log("Skills table created successfully.");
      }
    }
  );
});

// Close database connection
db.close((err) => {
  if (err) {
    return console.error("Error closing database:", err.message);
  }
  console.log("Database connection closed.");
});
