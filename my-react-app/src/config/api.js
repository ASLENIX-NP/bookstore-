const API_BASE_URL =
  window.location.hostname === "localhost" ||
  window.location.hostname === "127.0.0.1"
    ? "https://bookstore-f3if.onrender.com"
    : `http://${window.location.hostname}:5000`;

export default API_BASE_URL;