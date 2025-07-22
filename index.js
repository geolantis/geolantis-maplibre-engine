const express = require("express");
const path = require("path");
const app = express();
const port = process.env.PORT || 3000;

app.get("/health", (req, res) => {
  res.json({ status: "Server is running" });
});

app.use(express.static(__dirname));

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
