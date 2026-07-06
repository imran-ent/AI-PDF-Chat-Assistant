import axios from "axios";

const api = axios.create({
    baseURL: "https://ai-pdf-chat-assistant-1.onrender.com",
    headers: {
        "Content-Type": "application/json",
    },
});

export default api;