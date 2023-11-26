import axios from "axios";
import { PUBLIC_API_URL } from "$env/static/public";
import { currentUser } from "$lib/stores/auth";
import { goto } from "$app/navigation";

export const client = axios.create({
    baseURL: PUBLIC_API_URL,
    proxy: false,
    // Only throw an AxiosError when 500 happens
    validateStatus: (status) => status < 500,
    withCredentials: true
});

client.interceptors.response.use((response) => {
    if (response.status === 401 && response.data?.status === "unauthorized") {
        // reset logged in user
        currentUser.set(null);

        console.log(response.config.url, response.config.url != '/auth/me');

        // redirect to login, not on /auth/me
        if (response.config.url != '/auth/me') {
            console.log('login redirect');
            goto('/login');
        }
    }

    return response;
}, (error) => {
    return Promise.reject(error)
})
