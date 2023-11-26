import { errorInfoFromResponse } from '$lib/common/error.js';
import { client } from '$lib/http/http.js';
import type { Group } from '$lib/types/group';
import type { ResponseFormat } from '$lib/types/response.js';
import type { Thread } from '$lib/types/thread';
import { error } from '@sveltejs/kit';

export async function load({ params }) {
    const groupId = params.groupId;

    const groupRes = await client.get<ResponseFormat<Group>>(`/groups/${groupId}`, {
        params: {
            expand: ["members"].join(",")
        }
    });

    if (groupRes.status !== 200) {
        throw error(groupRes.status, errorInfoFromResponse(groupRes));
    }

    // load threads in this group

    const threadsRes = await client.get<ResponseFormat<Thread[]>>(`/groups/${groupId}/threads`);

    if (threadsRes.status !== 200) {
        throw error(threadsRes.status, errorInfoFromResponse(threadsRes));
    }

    return {
        group: groupRes.data.data,
        threads: threadsRes.data.data
    }
}