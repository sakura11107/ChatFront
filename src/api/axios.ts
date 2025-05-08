import axios from "axios";
import type {AxiosInstance ,AxiosRequestConfig,AxiosResponse,InternalAxiosRequestConfig} from "axios";

const axiosInstance: AxiosInstance = axios.create({
    baseURL: "http://localhost:8080/",
    timeout: 10000,
    headers: {
        "Content-Type": "application/json",
    },
});

axiosInstance.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
        const token = localStorage.getItem("token");
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

axiosInstance.interceptors.response.use(
    (response: AxiosResponse) => {
        return response.data;
    },
    (error) => {
        return Promise.reject(error);
    }
);

const request = <T>(config :  AxiosRequestConfig):Promise<T> => {
    return new Promise((resolve, reject) => {
        axiosInstance
            .request(config)
            .then((response) => {
                resolve(response.data);
            })
            .catch((error) => {
                reject(error);
            });
    });
};

export const get = <T>(url: string, params?: any): Promise<T> => {
    return request<T>({ url, method: 'get', params });
};

export const post = <T>(url: string, data?: any): Promise<T> => {
    return request<T>({ url, method: 'post', data });
};