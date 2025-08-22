// models/db.js
const mysql = require("mysql2");

// Create connection without DB first (to ensure DB exists)
const db = mysql.createConnection({
  host: process.env.DB_HOST,       // e.g. myapp-db.xxxxx.rds.amazonaws.com
  user: process.env.DB_USER,       // e.g. admin
  password: process.env.DB_PASSWORD, // FIXED: use DB_PASSWORD (not DB_PASS)
  multipleStatements: true
});

db.connect((err) => {
  if (err) {
    console.error("❌ Error connecting to MySQL:", err.message);
    process.exit(1);
  }
  console.log("✅ MySQL Connected");

  const dbName = process.env.DB_NAME;

  // Ensure DB exists
  db.query(`CREATE DATABASE IF NOT EXISTS \`${dbName}\``, (err) => {
    if (err) {
      console.error("❌ Error creating database:", err.message);
      process.exit(1);
    }
    console.log(`✅ Database '${dbName}' is ready.`);

    // Switch to DB
    db.changeUser({ database: dbName }, (err) => {
      if (err) {
        console.error("❌ Error switching database:", err.message);
        process.exit(1);
      }

      // Create users table
      const createUsersTable = `
        CREATE TABLE IF NOT EXISTS users (
          id INT AUTO_INCREMENT PRIMARY KEY,
          name VARCHAR(100) NOT NULL,
          email VARCHAR(100) UNIQUE NOT NULL,
          password VARCHAR(255) NOT NULL,
          role VARCHAR(20) DEFAULT 'user',
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `;

      db.query(createUsersTable, (err) => {
        if (err) {
          console.error("❌ Error creating users table:", err.message);
          process.exit(1);
        }
        console.log("✅ Users table ensured.");
      });
    });
  });
});

module.exports = db;
