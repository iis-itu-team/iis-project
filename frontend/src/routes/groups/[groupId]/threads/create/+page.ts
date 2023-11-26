import { errorInfoFromResponse } from '$lib/common/error';
import { client } from '$lib/http/http.js';
import type { Group } from '$lib/types/group';
import type { ResponseFormat } from '$lib/types/response.js';
import { error } from '@sveltejs/kit';

export async function load({ params }) {
    const groupId = params.groupId;

    const groupRes = await client.get<ResponseFormat<Group>>(`/groups/${groupId}`);

    if (groupRes.status !== 200) {
        throw error(groupRes.status, errorInfoFromResponse(groupRes));
    }

    return {
        groupRes: groupRes.data.data
    }
}