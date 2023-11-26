import type { ResponseFormat } from "$lib/types";
import type { ErrorInfo } from "$lib/types/error";
import type { AxiosResponse } from "axios";

export const errorInfoFromResponse = (res: AxiosResponse<ResponseFormat<any>>) => {
    const data = res.data;
    const message = typeof res.data.error == 'string' ? res.data.error : 'No description provided.';

    return {
        statusCode: res.status,
        statusText: res.statusText,
        status: data.status,
        message,
    } as ErrorInfo;
}
