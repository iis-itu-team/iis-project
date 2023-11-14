export interface User {
    id: string

    nickname: string
    email: string
}

export type LoginInput = {
    email: string
    password: string
}

export type RegisterInput = {
    nickname: string
    email: string
    password: string
}
