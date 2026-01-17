import axios from "axios";

const api = axios.create({
    baseURL: import.meta.env.VITE_BACKEND_URL + '/api'
})

const HelloResponsePath = '/hello';
export interface IHelloResponse {
    message: string;
    time: string;
    version: string;
}

export const HelloResponse = async (): Promise<IHelloResponse> => {
    const {data} = await api.get<IHelloResponse>(HelloResponsePath);
    return data;
} 


