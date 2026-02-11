import axios from "axios";

const api = axios.create({
    baseURL: "https://reeparando-api.onrender.com", // URL de la Mock API
});

export default api;