import type { HTMLInputTypeAttribute } from "svelte/elements";

export type FormFields = {
    [key: string]: {
        validate?: (val?: any, values?: any) => string | undefined;
        title: string;
        type: HTMLInputTypeAttribute;
        radioOptions?: { value: string; text: string; description: string }[];
    };
};
