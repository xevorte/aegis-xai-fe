import type { HealthPayload, PredictAllResponse } from "@/lib/types";

const ANALYSIS_SESSION_KEY = "aegis:last-analysis";

export type AnalysisSession = {
  payload: HealthPayload;
  analysis: PredictAllResponse;
  savedAt: string;
};

export function saveAnalysisSession(payload: HealthPayload, analysis: PredictAllResponse) {
  if (typeof window === "undefined") return;
  const session: AnalysisSession = { payload, analysis, savedAt: new Date().toISOString() };
  try {
    window.sessionStorage.setItem(ANALYSIS_SESSION_KEY, JSON.stringify(session));
  } catch {
    // A blocked or full session storage must not prevent showing the result.
  }
}

export function readAnalysisSession(): AnalysisSession | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.sessionStorage.getItem(ANALYSIS_SESSION_KEY);
    return raw ? JSON.parse(raw) as AnalysisSession : null;
  } catch {
    return null;
  }
}
