const express = require("express");
const app = express();
require("dotenv").config();
const router = require("./src/routers/routers");
const PORT = process.env.PORT || 3000;
const swaggerUi = require("swagger-ui-express");
const swaggerJson = {};

app.use(express.json({ strict: false }));
app.use("/documentation", swaggerUi.serve, swaggerUi.setup(swaggerJson));
app.use("/api/v1", router);

app.listen(PORT, () => {
  console.log(`Server is running at PORT ${PORT}`);
});
