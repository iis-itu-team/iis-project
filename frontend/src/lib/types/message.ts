import type { Group } from "./group";
import type { User } from "./user";

export interface Message {
    id: string

    owner_id: string;
    owner?: User;

    group_id: string;
    group?: Group;

    content: string;
	rating: number;

    user_rating: string | null;

	date: string;
}
