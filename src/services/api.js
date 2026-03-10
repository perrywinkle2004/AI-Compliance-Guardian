import axios from "axios";
import { getRole } from "../utils/role";

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || "http://localhost:3000",
});

api.interceptors.request.use((config) => {
    // AuthContext handles Authorization: Bearer token
    // X-Role can be kept or removed. backend ignores it now.
    // config.headers["X-Role"] = getRole(); 
    return config;
});

export default api;