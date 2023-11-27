import type { Visibility } from "./visibility"

export interface User {
    id: string;

    nickname: string;
    email: string;
    role: UserRole;
    visibility: Visibility;
}

export enum UserRole {
    USER = 'user',
    ADMIN = 'admin'
}

export type LoginInput = {
    uid?: string;
    password?: string;
}

export type RegisterInput = {
    nickname?: string;
    email?: string;
    password?: string;
}

export type Statistics = {
    positivelyRated: number;
    negativelyRated: number;
    joinedGroups: number;
    messagesPosted: number;
    ratingsSubmitted: number;
    userRating: number;
}
