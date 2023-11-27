import { errorInfoFromResponse } from '$lib/common/error.js';
import { client } from '$lib/http/http.js'
import type { ResponseFormat } from '$lib/types/response.js'
import type { Statistics, User } from '$lib/types/user.js'
import { error } from '@sveltejs/kit';

export async function load({ params }) {
    const userId = params.userId;

    const user = await client.get<ResponseFormat<User>>(`/users/${userId}`);

    if (user.status !== 200) {
        throw error(user.status, errorInfoFromResponse(user));
    }

    const statistics = await client.get<ResponseFormat<Statistics>>(`/users/${userId}/statistics`);

    if (statistics.status !== 200) {
        throw error(statistics.status, errorInfoFromResponse(statistics));
    }

    return {
        user: user.data.data!,
        statistics: statistics.data.data!
    }
}
