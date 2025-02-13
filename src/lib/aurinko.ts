import axios from "axios";

const aurinkoApi = axios.create({
    baseURL: "https://api.aurinko.io/v1",
});

const handleError = (error: unknown) => {
    if (axios.isAxiosError(error)) {
        console.error(error?.response?.data);
    }

    return Promise.reject(error as Error);
};

aurinkoApi.interceptors.response.use((response) => response, handleError);
export { aurinkoApi };
