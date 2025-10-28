const DEV = "http://localhost:5000";
const PROD = "https://your-deployed-backend-url";

export const API_BASE =
  window.location.hostname === "localhost" ? DEV : PROD;
