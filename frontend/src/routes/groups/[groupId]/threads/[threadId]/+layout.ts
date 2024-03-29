import { errorInfoFromResponse } from '$lib/common/error';
import { client } from '$lib/http/http.js';
import type { Message, Thread } from '$lib/types';
import type { ResponseFormat } from '$lib/types/response.js';
import { error } from '@sveltejs/kit';

export async function load({ params }) {
    const groupId = params.groupId;
    const threadId = params.threadId;

    const threadRes = await client.get<ResponseFormat<Thread>>(`/threads/${threadId}`);

    if (threadRes.status !== 200) {
        throw error(threadRes.status, errorInfoFromResponse(threadRes));
    }

    return {
        thread: threadRes.data.data,
        threadId: threadId,
        groupId: groupId
    }
}
