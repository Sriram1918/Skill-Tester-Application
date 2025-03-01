const sqlite3 = require("sqlite3").verbose();
const fs = require("fs");
const path = require("path");

const DB_FILE = path.join(__dirname, "../database/database.sqlite");

// Create a new database connection
const db = new sqlite3.Database(DB_FILE, (err) => {
  if (err) {
    console.error("Error connecting to SQLite:", err.message);
  } else {
    console.log("Connected to SQLite database.");
    initializeDatabase();
  }
});

// Function to initialize the database
function initializeDatabase() {
  // Read schema.sql and execute it
  const schemaPath = path.join(__dirname, "../database/schema.sql");
  if (fs.existsSync(schemaPath)) {
    const schemaSql = fs.readFileSync(schemaPath, "utf8");
    db.exec(schemaSql, (err) => {
      if (err) {
        console.error("Error executing schema.sql:", err.message);
      } else {
        console.log("Tables created successfully.");
        insertInitialData();
      }
    });
  }
}

// Function to insert initial data
function insertInitialData() {
  const initPath = path.join(__dirname, "../database/init.sql");
  if (fs.existsSync(initPath)) {
    const initSql = fs.readFileSync(initPath, "utf8");
    db.exec(initSql, (err) => {
      if (err) {
        console.error("Error inserting initial data:", err.message);
      } else {
        console.log("Initial data inserted successfully.");
        insertNewUser();
      }
    });
  }
}

// Function to insert second user data
function insertNewUser() {
  const newUserPath = path.join(__dirname, "../database/new_user.sql");
  if (fs.existsSync(newUserPath)) {
    const newUserSql = fs.readFileSync(newUserPath, "utf8");
    db.exec(newUserSql, (err) => {
      if (err) {
        console.error("Error inserting new user data:", err.message);
      } else {
        console.log("New user data inserted successfully.");
      }
    });
  }
}

module.exports = { db };
