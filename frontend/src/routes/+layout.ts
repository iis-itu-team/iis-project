import { client } from "$lib/http/http";
import type { User } from "$lib/types";
import type { ResponseFormat } from "$lib/types/response";

// disable ssr, no auth present on server requests
export const ssr = false;

export async function load() {
    const userRes = await client.get<ResponseFormat<User>>("/auth/me");

    return {
        user: userRes.data.data
    };
}