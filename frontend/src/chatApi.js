import axios from "axios";

const chatApi = axios.create({
  baseURL: import.meta.env.VITE_CHATBOT_URL,
});

export default chatApi;