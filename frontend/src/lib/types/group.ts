import type { Thread } from "./thread";
import type { User } from "./user";
import type { Visibility } from "./visibility";

export interface Group {
    id: string;
    title: string;
    visibility: Visibility;
	membership: Membership;

    threads?: Thread[];
    members?: Member[];
}

export enum Membership {
	TRUE = "true",
	FALSE = "false"
}

export enum GroupRequestStatus {
    WAITING = "waiting",
    ACCEPTED = "accepted",
    DENIED = "denied"
}

export type GroupRequest = {
    id: string
    
    group_id: string
    status: GroupRequestStatus
    type: GroupRequestType

    group?: Group
    user?: User
}

export enum GroupRequestType {
    JOIN = "join",
    MOD = "mod"
}

export type Member = Omit<User, 'role'> & {
    group_role: GroupRole
}

export enum GroupRole {
    MEMBER = 'member',
    MOD = 'mod',
    ADMIN = 'admin'
}
