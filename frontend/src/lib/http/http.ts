import axios from "axios";
import { PUBLIC_API_URL } from "$env/static/public";

export const client = axios.create({
    baseURL: PUBLIC_API_URL,
    proxy: false,
    // Only throw an AxiosError when 500 happens
    validateStatus: (status) => status < 500,
    withCredentials: true
});
