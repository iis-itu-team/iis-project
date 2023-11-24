import { client } from '$lib/http/http.js'
import type { ResponseFormat } from '$lib/types/response.js'
import type { User } from '$lib/types/user.js'
import { error } from '@sveltejs/kit';

export async function load({ params }) {
    const userId = params.userId;

    const user = await client.get<ResponseFormat<User>>(`/users/${userId}`);

    if (user.status !== 200) {
        throw error(user.status, user.data.error);
    }

    return {
        user: user.data
    }
}
