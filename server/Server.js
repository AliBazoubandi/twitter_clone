require("dotenv").config({ path: "./scripts/.env" });

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const userRoutes = require("./routes/userRoutes");
const tweetRoutes = require("./routes/tweetRoutes");
const authenticateUser = require("./middlewares/authenticateUser");
const swaggerUi = require("swagger-ui-express");
const swaggerDocument = require("./swagger-output.json");
const fileUpload = require("express-fileupload");

const app = express();

app.use(cors());
app.use(express.json());
app.use(cookieParser());
app.use(fileUpload());

mongoose.connect("mongodb://localhost:27017/twitter_clone");

// Routes
app.use("/api/users", userRoutes);
app.use("/api/tweets", tweetRoutes);

// Serve Swagger documentation
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// Default route
app.get("/", (req, res) => {
  res.send("Server is running!");
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
