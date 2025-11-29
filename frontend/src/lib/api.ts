import axios from "axios";

export const api = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8000",
    headers: { "Content-Type": "application/json" },
});

api.interceptors.request.use((config) => {
    const token = localStorage.getItem("token");
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

interface FailedRequest {
    resolve: (token: string) => void;
    reject: (error: any) => void;
}

let isRefreshing = false;
let failedQueue: FailedRequest[] = [];

const processQueue = (error: any, token: string | null = null) => {
    failedQueue.forEach((prom) => {
        if (error) {
            prom.reject(error);
        } else {
            prom.resolve(token!);
        }
    });
    failedQueue = [];
};

api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        if (error.response?.status === 401 && !originalRequest._retry) {
            if (isRefreshing) {
                return new Promise<string>((resolve, reject) => {
                    failedQueue.push({ resolve, reject });
                })
                    .then((token) => {
                        originalRequest.headers.Authorization = `Bearer ${token}`;
                        return api(originalRequest);
                    })
                    .catch((err) => Promise.reject(err));
            }

            originalRequest._retry = true;
            isRefreshing = true;

            try {
                const refreshToken = localStorage.getItem("refresh_token");
                if (!refreshToken) {
                    throw new Error("No refresh token");
                }

                // Use a separate axios instance or direct axios to avoid interceptor loop
                // But since we check _retry, it might be fine.
                // However, to be safe and avoid attaching auth header (which might be expired), use axios directly.
                const response = await axios.post(`${api.defaults.baseURL}/api/auth/refresh`, null, {
                    params: { refresh_token: refreshToken },
                });

                const { access_token, refresh_token: newRefreshToken } = response.data;

                localStorage.setItem("token", access_token);
                localStorage.setItem("refresh_token", newRefreshToken);

                api.defaults.headers.common.Authorization = `Bearer ${access_token}`;
                originalRequest.headers.Authorization = `Bearer ${access_token}`;

                processQueue(null, access_token);
                return api(originalRequest);
            } catch (refreshError) {
                processQueue(refreshError, null);
                localStorage.removeItem("token");
                localStorage.removeItem("refresh_token");
                window.location.href = "/login";
                return Promise.reject(refreshError);
            } finally {
                isRefreshing = false;
            }
        }

        return Promise.reject(error);
    }
);

// Axios-Fehler -> lesbare Message
export function toErrorMessage(e: unknown): string {
    if (axios.isAxiosError(e)) {
        const data = e.response?.data as any;
        return data?.detail ?? e.message;
    }
    return (e as any)?.message ?? "Unbekannter Fehler";
}
