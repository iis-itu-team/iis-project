import type { User } from "./user";

export interface Message {
    id: string

    ownerId: string;
    owner: User;
    
    groupId: string;

    content: string;
}