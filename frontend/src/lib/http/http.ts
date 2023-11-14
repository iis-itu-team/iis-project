import axios from "axios";
import { PUBLIC_API_URL } from "$env/static/public";

export const client = axios.create({
    baseURL: PUBLIC_API_URL
});

/* client.interceptors.response.use((response) => {
    // not authorized
    if (response.status === 401 && response.data.status === 'unauthorized') {
        // redirect to login

        //@ts-ignore
        window.location = '/login';
    }
    return response;
}, (error) => {
    //
}) */
