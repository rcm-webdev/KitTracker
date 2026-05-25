import axios, { AxiosError, type AxiosResponse } from "axios";

const axiosInstance = axios.create({
  withCredentials: true,
  headers: { "Content-Type": "application/json" },
});

export async function apiFetch(
  path: string,
  options: RequestInit = {}
): Promise<AxiosResponse> {
  const { body, method = "GET", headers } = options;
  return axiosInstance.request({
    url: path,
    method,
    data: typeof body === "string" ? JSON.parse(body) : body,
    headers: headers as Record<string, string> | undefined,
  });
}

export async function apiFetchJson<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  try {
    const res = await apiFetch(path, options);
    return res.data as T;
  } catch (err) {
    if (err instanceof AxiosError) {
      const message =
        err.response?.data?.error ?? `HTTP ${err.response?.status ?? "unknown"}`;
      throw new Error(message);
    }
    throw err;
  }
}
