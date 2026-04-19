import { config } from "./src/config/config.js";
import { connectDB } from "./src/config/connectDB.js";
import { app } from "./src/app.js";

const PORT = config.port;

app.listen(PORT, () => {
  console.log(`Server running in ${config.nodeEnv} mode on port ${PORT}`);
  connectDB();
});
