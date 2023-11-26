import { errorInfoFromResponse } from "$lib/common/error";
import { client } from "$lib/http/http";
import type { User } from "$lib/types";
import type { ResponseFormat } from "$lib/types/response";
import { error } from "@sveltejs/kit";

// disable ssr, no auth present on server requests
export const ssr = false;

export async function load() {
    const userRes = await client.get<ResponseFormat<User>>("/auth/me");

    if (userRes.status !== 401 && userRes.status !== 200) {
        throw error(userRes.status, errorInfoFromResponse(userRes));
    }

    return {
        user: userRes.data.data
    };
}