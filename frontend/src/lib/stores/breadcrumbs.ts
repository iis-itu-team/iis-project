import { writable } from "svelte/store";

export interface Breadcrumb {
    text: string;
    href?: string;
    selected?: boolean;
}

export const breadcrumbs = writable<Breadcrumb[]>([]);
export const show = writable<boolean>(false);

export const showCrumbs = (val: boolean = true) => {
    show.update((value) => val);
}

export const setCrumbs = (crumbs: Breadcrumb[]) => {
    breadcrumbs.set(crumbs);
}
