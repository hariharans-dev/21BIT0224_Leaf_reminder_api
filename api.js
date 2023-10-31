const express = require("express");
const app = express();
const user_router = require("./routes/user_route"); // Ensure the correct path to your router file
const inventory_router = require("./routes/inventory_route");
const devicedata_router = require("./routes/devicedata_router");
// const test_router = require("./routes/test");

app.use(express.json());

// Use the router for a specific path prefix (e.g., /api)
app.use("/api/users", user_router);
app.use("/api/inventory", inventory_router);
app.use("/api/device", devicedata_router);
// app.use("/api/test", test_router);

const PORT = process.env.PORT;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
