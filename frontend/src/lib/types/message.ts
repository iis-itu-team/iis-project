import type { Group } from "./group";
import type { User } from "./user";

export interface Message {
    id: string

    ownerId: string;
    owner?: User;

    groupId: string;
    group?: Group;

    content: string;
	rating: number;

    user_rating: string | null;

	date: string;
}
