const fs = require("fs");
const crypto = require("crypto");

// Generate a random 32-character hexadecimal string
const secretKey = crypto.randomBytes(16).toString("hex");

fs.writeFileSync(".env", `SECRET_KEY=${secretKey}\n`);

console.log("Secret key generated and saved!");
