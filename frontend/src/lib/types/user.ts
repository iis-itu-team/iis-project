export interface User {
    id: string

    nickname: string
    email: string
}

export type LoginInput = {
    uid: string
    password: string
}

export type RegisterInput = {
    nickname: string
    email: string
    password: string
}
