import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:5000/api",
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use(
  (config) => {
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response) {
      console.error(
        "API Error:",
        error.response.data?.message || error.message
      );
    } else if (error.request) {
      console.error("Server not responding.");
    } else {
      console.error(error.message);
    }

    return Promise.reject(error);
  }
);

export default api;