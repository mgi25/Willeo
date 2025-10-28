const DEV = "http://localhost:5000";
const PROD = "https://your-backend-url.onrender.com";

export const API_BASE =
  window.location.hostname === "localhost" ? DEV : PROD;
