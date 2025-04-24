export interface RegisterResponse {
    message: string,
    newUser: User
}

export interface User {
    id: number,
    name: string,
    email: string,
    password: string,
    createdAt: string
}

export interface LoginResponse {
    message: string,
    accessToken: string,
}

export interface RefreshTokenResponse {
    accessToken: string
}