import { client } from '$lib/http/http.js'
import type { ResponseFormat } from '$lib/types/response.js'
import type { User } from '$lib/types/user.js'

export async function load({ params }) {
    const userId = params.userId;

    const user = await client.get<ResponseFormat<User>>(`/users/${userId}`);

    return {
        user: user.data.data
    }
}
