import axios from "axios";

const api = axios.create({
    baseURL: "https://ai-pdf-chat-assistant-1.onrender.com",
});

export default api;