require("dotenv").config();
const express = require("express");
const cors = require("cors");
const authMiddleware = require("./middleware/auth");
const { db } = require("./config/database"); // Import SQLite database
const skillsRouter = require("./routes/skills");

const app = express();

app.use(cors());
app.use(express.json());

// Public routes
app.use("/api/auth", require("./routes/auth"));

// Protected routes
app.use("/api/courses", authMiddleware, require("./routes/courses"));
app.use(
  "/api/certifications",
  authMiddleware,
  require("./routes/certifications")
);
app.use("/api/skills", authMiddleware, skillsRouter);
app.use("/api/workshops", authMiddleware, require("./routes/workshops"));
app.use("/api/dashboard", authMiddleware, require("./routes/dashboard"));
app.use("/api/reports", authMiddleware, require("./routes/reports"));
app.use("/api/profile", authMiddleware, require("./routes/profile"));

const PORT = process.env.PORT || 3002;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
