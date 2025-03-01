const sqlite3 = require("sqlite3").verbose();

const db = new sqlite3.Database("database.db", (err) => {
  if (err) {
    return console.error("Error connecting to database:", err.message);
  }
  console.log("Connected to SQLite database.");
});

// Insert sample users
db.run(
  `INSERT INTO users (name, email) VALUES 
    ('Alice Johnson', 'alice@example.com'),
    ('Bob Smith', 'bob@example.com')
`,
  (err) => {
    if (err) {
      console.error("Error inserting users:", err.message);
    } else {
      console.log("Sample users inserted successfully.");
    }
  }
);

// Insert sample skills
db.run(
  `INSERT INTO skills (user_id, skill_name, experience_level) VALUES 
    (1, 'JavaScript', 'Intermediate'),
    (1, 'Python', 'Advanced'),
    (2, 'Java', 'Beginner')
`,
  (err) => {
    if (err) {
      console.error("Error inserting skills:", err.message);
    } else {
      console.log("Sample skills inserted successfully.");
    }
  }
);

// Close database connection
db.close((err) => {
  if (err) {
    return console.error("Error closing database:", err.message);
  }
  console.log("Database connection closed.");
});
