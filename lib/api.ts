import type { CounterfactualResponse, HealthPayload, MetricsResponse, PredictAllResponse, PredictBestResponse, PredictLiteResponse } from "@/lib/types";

const API_URL = (process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000").replace(/\/$/, "");

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const controller = new AbortController();
  const timeout = window.setTimeout(() => controller.abort(), 60_000);
  const signal = init?.signal ? combineSignals(init.signal, controller.signal) : controller.signal;
  let response: Response;
  try {
    response = await fetch(`${API_URL}${path}`, {
      ...init,
      signal,
      headers: { "Content-Type": "application/json", ...(init?.headers ?? {}) },
    });
  } catch (error) {
    if (error instanceof DOMException && error.name === "AbortError") {
      throw new Error("Permintaan terlalu lama. Pastikan backend berjalan di http://localhost:8000 lalu coba lagi.");
    }
    throw new Error("Backend belum dapat dihubungi. Pastikan layanan API berjalan di http://localhost:8000.");
  } finally {
    window.clearTimeout(timeout);
  }
  if (!response.ok) {
    let detail = `Permintaan gagal (${response.status})`;
    try {
      const body = (await response.json()) as { detail?: string };
      detail = body.detail ?? detail;
    } catch {
      // Keep the HTTP status when the backend does not return JSON.
    }
    throw new Error(detail);
  }
  return response.json() as Promise<T>;
}

function combineSignals(first: AbortSignal, second: AbortSignal) {
  const controller = new AbortController();
  const abort = () => controller.abort();
  first.addEventListener("abort", abort, { once: true });
  second.addEventListener("abort", abort, { once: true });
  return controller.signal;
}

export function predictAll(payload: HealthPayload) {
  return request<PredictAllResponse>("/api/predict-all", { method: "POST", body: JSON.stringify(payload) });
}

export function predictLite(payload: HealthPayload, signal?: AbortSignal) {
  return request<PredictLiteResponse>("/api/predict-lite", { method: "POST", body: JSON.stringify(payload), signal });
}

export function predictBest(payload: HealthPayload) {
  return request<PredictBestResponse>("/api/predict-best", { method: "POST", body: JSON.stringify(payload) });
}

export function getCounterfactual(payload: HealthPayload) {
  return request<CounterfactualResponse>("/api/counterfactual", { method: "POST", body: JSON.stringify(payload) });
}

export function getMetrics() {
  return request<MetricsResponse>("/api/metrics");
}
