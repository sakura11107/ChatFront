import {post} from './axios.ts'

interface Response{
    code: number;
    message: string;
    data: string;
}

export const login = (data:any):Promise<Response> => {
    return post('/api/auth/login',data)
}
export const register = (data:any):Promise<Response> => {
    return post('/api/auth/register',data)
}