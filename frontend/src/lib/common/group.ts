import { client } from "$lib/http/http";
import { type ResponseFormat, GroupRequestType, type Group, type GroupRequest } from "$lib/types";
import { toasts } from "svelte-toasts";

export const requestToJoin = async (group?: Group) => {
    const res = await client.post<ResponseFormat<GroupRequest>>(`/groups/${group?.id}/requests`, {
        type: GroupRequestType.JOIN
    });

    if (res.status !== 200) {
        if (res.data.status == 'already_joined') {
            toasts.add({
                type: 'error',
                description: 'You are already joined in this group.'
            });
            return;
        }

        if (res.data.status == 'already_exists') {
            toasts.add({
                type: 'error',
                description: 'You already requested to join, wait for a response.'
            });
            return;
        }

        toasts.add({
            type: 'error',
            description: 'Something went wrong.'
        });
        return;
    }

    toasts.add({
        type: 'success',
        description: 'Sent a request to join this group.'
    });

    return res.data.data
};
