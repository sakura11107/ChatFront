import {post} from './axios.ts'

// export const login = (data:any) => {
//     return post('/login',data)
// }
interface RegisterResponse{
    code: number;
    message: string;
    data: string;
}
export const register = (data:any):Promise<RegisterResponse> => {
    return post('/api/auth/register',data)
}