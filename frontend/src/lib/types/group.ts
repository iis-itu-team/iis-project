import type { Thread } from "./thread";
import type { User } from "./user";
import type { Visibility } from "./visibility";

export interface Group {
    id: string;
    title: string;
    visibility: Visibility;

    threads?: Thread[];
    members?: Member[];
}

export type Member = Omit<User, 'role'> & {
    group_role: GroupRole
}

export enum GroupRole {
    MEMBER = 'member',
    MOD = 'mod',
    ADMIN = 'admin'
}
