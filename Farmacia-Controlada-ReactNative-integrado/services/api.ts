import { Platform } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

export const TOKEN_STORAGE_KEY = "@farmacia_controlada:token";
export const AUTH_STORAGE_KEY = "@farmacia_controlada:auth";

export type TipoConta = "usuario" | "empresa";

export type AuthData = {
  token: string;
  tipoConta: TipoConta;
  usuario?: any;
  empresa?: any;
};

const defaultApiUrl = Platform.select({
  android: "http://192.168.10.127:3333/api",
  ios: "http://192.168.10.127:3333/api",
  web: "http://192.168.10.127:3333/api",
  default: "http://192.168.10.127:3333/api",
});

export const API_BASE_URL =
  process.env.EXPO_PUBLIC_API_URL?.replace(/\/$/, "") ?? defaultApiUrl!;

export async function salvarAuth(data: AuthData) {
  await AsyncStorage.setItem(TOKEN_STORAGE_KEY, data.token);
  await AsyncStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(data));
}

export async function obterAuth(): Promise<AuthData | null> {
  const raw = await AsyncStorage.getItem(AUTH_STORAGE_KEY);
  return raw ? JSON.parse(raw) : null;
}

export async function obterToken() {
  return AsyncStorage.getItem(TOKEN_STORAGE_KEY);
}

export async function limparAuth() {
  await AsyncStorage.multiRemove([TOKEN_STORAGE_KEY, AUTH_STORAGE_KEY]);
}

type RequestOptions = RequestInit & {
  auth?: boolean;
};

async function request<T>(
  path: string,
  options: RequestOptions = {},
): Promise<T> {
  const headers = new Headers(options.headers);

  if (!(options.body instanceof FormData)) {
    headers.set("Content-Type", "application/json");
  }

  if (options.auth !== false) {
    const token = await obterToken();

    if (token) {
      headers.set("Authorization", `Bearer ${token}`);
    }
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers,
  });

  const contentType = response.headers.get("content-type");
  const isJson = contentType?.includes("application/json");
  const data = isJson ? await response.json() : await response.text();

  if (!response.ok) {
    const message =
      typeof data === "object" && data && "message" in data
        ? String((data as { message?: string }).message)
        : "Erro ao comunicar com a API.";

    throw new Error(message);
  }

  return data as T;
}

export const api = {
  get: <T>(path: string, options?: RequestOptions) =>
    request<T>(path, { ...options, method: "GET" }),
  post: <T>(path: string, body?: unknown, options?: RequestOptions) =>
    request<T>(path, {
      ...options,
      method: "POST",
      body: body instanceof FormData ? body : JSON.stringify(body ?? {}),
    }),
  put: <T>(path: string, body?: unknown, options?: RequestOptions) =>
    request<T>(path, {
      ...options,
      method: "PUT",
      body: JSON.stringify(body ?? {}),
    }),
  patch: <T>(path: string, body?: unknown, options?: RequestOptions) =>
    request<T>(path, {
      ...options,
      method: "PATCH",
      body: JSON.stringify(body ?? {}),
    }),
  delete: <T>(path: string, options?: RequestOptions) =>
    request<T>(path, { ...options, method: "DELETE" }),
};

export const authApi = {
  async loginUsuario(login: string, senha: string) {
    const data = await api.post<AuthData>(
      "/auth/usuario/login",
      { login, senha },
      { auth: false },
    );
    await salvarAuth(data);
    return data;
  },

  async loginEmpresa(cnpj: string, senha: string) {
    const data = await api.post<AuthData>(
      "/auth/empresa/login",
      { cnpj, senha },
      { auth: false },
    );
    await salvarAuth(data);
    return data;
  },
};

export function criarFormDataImagem(uri: string, fieldName = "imagem") {
  const extension = uri.split(".").pop()?.toLowerCase() || "jpg";
  const mimeType =
    extension === "png"
      ? "image/png"
      : extension === "webp"
        ? "image/webp"
        : "image/jpeg";
  const formData = new FormData();

  formData.append(fieldName, {
    uri,
    name: `imagem.${extension}`,
    type: mimeType,
  } as unknown as Blob);

  return formData;
}
