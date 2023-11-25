import axios from "axios";
import { PUBLIC_API_URL } from "$env/static/public";
import { currentUser } from "$lib/stores/auth";

export const client = axios.create({
    baseURL: PUBLIC_API_URL,
    proxy: false,
    // Only throw an AxiosError when 500 happens
    validateStatus: (status) => status < 500,
    withCredentials: true
});

client.interceptors.response.use((response) => {
    // reset logged in user
    if (response.status === 401 && response.data?.status === "unauthorized") {
        currentUser.set(null);
    }

    return response;
}, (error) => {
    return Promise.reject(error)
})
