import { errorInfoFromResponse } from "$lib/common/error";
import { client } from "$lib/http/http";
import type { ResponseFormat } from "$lib/types";
import type { GroupRequest } from "$lib/types/group";
import { error } from "@sveltejs/kit";

export async function load({ params }) {
    const groupId = params.groupId

    const requestsRes = await client.get<ResponseFormat<GroupRequest[]>>(`/groups/${groupId}/requests`, {
        params: {
            expand: ["group", "user"].join(",")
        }
    });

    if (requestsRes.status !== 200) {
        throw error(requestsRes.status, errorInfoFromResponse(requestsRes));
    }

    return {
        requests: requestsRes.data.data
    }
}
