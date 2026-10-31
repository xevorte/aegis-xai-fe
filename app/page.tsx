"use client";

import { useEffect, useState } from "react";
import { getCounterfactual, predictAll, predictBest, predictLite } from "@/lib/api";
import type { ConditionBlock, CounterfactualResponse, HealthPayload, PredictAllResponse, PredictBestResponse, PredictLiteResponse } from "@/lib/types";
import { UserConditionCard } from "@/features/analysis/UserConditionCard";
import { UserResultsPanel } from "@/features/analysis/UserResultsPanel";
import { ScreeningForm } from "@/features/screening/ScreeningForm";
import { WhatIfPreview } from "@/features/screening/WhatIfPreview";
import { initialPayload } from "@/features/screening/constants";
import { validatePayload } from "@/features/screening/validation";

const preferredConditionOrder = ["diabetes", "hypertension", "high_cholesterol", "heart_disease", "stroke"];

function getConditionKeys(conditions: PredictAllResponse["conditions"] | null) {
  if (!conditions) return preferredConditionOrder;
  const keys = Object.keys(conditions);
  return [...preferredConditionOrder.filter((key) => keys.includes(key)), ...keys.filter((key) => !preferredConditionOrder.includes(key))];
}

function mergePrimaryDiabetes(result: PredictAllResponse, primary: PredictBestResponse): PredictAllResponse {
  const diabetes = result.conditions.diabetes;
  if (!diabetes) return result;
  const bestModel = primary.best_model;
  const primaryBlock: ConditionBlock = {
    ...diabetes,
    diagnosis: primary.summary.final_diagnosis,
    risk_percent: primary.summary.risk_score_percent,
    score_note: primary.summary.score_note,
    consensus: `Model utama: ${bestModel.display_name ?? bestModel.key ?? "model terbaik"}`,
    best_model: {
      ...diabetes.best_model,
      ...bestModel,
    },
    explainable_ai: primary.explainable_ai ?? diabetes.explainable_ai,
    disclaimer: primary.disclaimer ?? diabetes.disclaimer,
  };
  return { ...result, conditions: { ...result.conditions, diabetes: primaryBlock } };
}

export default function HomePage() {
  const [payload, setPayload] = useState<HealthPayload>(initialPayload);
  const [analysis, setAnalysis] = useState<PredictAllResponse | null>(null);
  const [activeCondition, setActiveCondition] = useState("diabetes");
  const [lite, setLite] = useState<PredictLiteResponse | null>(null);
  const [counterfactual, setCounterfactual] = useState<CounterfactualResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    const timer = window.setTimeout(() => {
      predictLite(payload, controller.signal).then(setLite).catch((reason) => {
        if (reason instanceof DOMException && reason.name === "AbortError") return;
        setLite(null);
      });
    }, 500);
    return () => { window.clearTimeout(timer); controller.abort(); };
  }, [payload]);

  const updateField = (key: keyof HealthPayload, value: number) => setPayload((current) => ({ ...current, [key]: value }));

  const runAnalysis = async () => {
    const validationError = validatePayload(payload);
    if (validationError) {
      setError(validationError);
      setStatus(null);
      return;
    }
    setLoading(true);
    setError(null);
    setCounterfactual(null);
    setStatus("Mengirim jawaban Anda ke layanan analisis…");
    try {
      const result = await predictAll(payload);
      let displayResult = result;
      let usedPrimaryModel = false;
      try {
        const primary = await predictBest(payload);
        displayResult = mergePrimaryDiabetes(result, primary);
        usedPrimaryModel = true;
      } catch {
        // Keep the multi-condition result usable when the optional primary endpoint is unavailable.
      }
      setAnalysis(displayResult);
      const firstCondition = Object.keys(displayResult.conditions)[0];
      if (firstCondition) setActiveCondition(firstCondition);
      setStatus(usedPrimaryModel
        ? "Analisis selesai. Ringkasan utama memakai model terbaik hasil validasi."
        : "Analisis selesai. Model utama belum tersedia, jadi ringkasan memakai hasil komparatif.");
      getCounterfactual(payload).then(setCounterfactual).catch(() => setCounterfactual(null));
      window.setTimeout(() => document.getElementById("results")?.scrollIntoView({ behavior: "smooth", block: "start" }), 50);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Backend belum dapat dihubungi. Pastikan layanan API berjalan.");
      setStatus(null);
    } finally {
      setLoading(false);
    }
  };

  const activeResult = analysis?.conditions[activeCondition];
  const conditionKeys = getConditionKeys(analysis?.conditions ?? null);
  const modelCount = lite?.model_predictions.length;

  return (
    <main>
      <header className="site-header"><a className="brand" href="#top"><span className="brand-mark">✦</span><span>Aegis <em>XAI</em></span></a><nav><a href="#screening">Skrining</a><a href="#results">Hasil saya</a><a href="/insights">Ruang teknis</a></nav><span className="header-status"><i /> API lokal · evaluasi internal</span><a className="header-cta" href="#screening">Mulai sekarang <span>↗</span></a></header>
      <section className="hero" id="top"><div className="hero-copy"><span className="eyebrow">PLATFORM SKRINING KESEHATAN · BRFSS</span><h1>Setiap sinyal kesehatan,<br /><em>lebih mudah dipahami.</em></h1><p>Aegis XAI merangkum pola risiko dari 21 indikator kesehatan, membandingkan model yang tersedia, lalu menunjukkan alasan yang bisa Anda baca.</p><div className="hero-actions"><a className="button button-primary" href="#screening">Mulai skrining <span>↘</span></a><a className="text-link" href="#about">Lihat cara kerja <span>→</span></a></div><div className="hero-proof"><span><i>✓</i> Penjelasan berbasis SHAP</span><span><i>✓</i> Data tetap di layanan lokal</span></div></div><div className="hero-art"><div className="hero-dashboard"><div className="hero-dashboard__top"><span>LIVE HEALTH SNAPSHOT</span><i>● Terhubung</i></div><div className="hero-dashboard__heading"><strong>Semua insight,<br /><em>dalam satu tampilan.</em></strong><span>BRFSS · 2026</span></div><div className="hero-dashboard__grid"><div className="hero-metric hero-metric--wide"><span>Skor skrining</span>{lite ? <b>{lite.summary.overall_risk_score_percent.toFixed(1)}<small>%</small></b> : <b>—</b>}<i className="hero-sparkline"><em /><em /><em /><em /><em /><em /><em /></i></div><div className="hero-metric"><span>Model aktif</span><b>{modelCount ?? "—"}</b><small>komparatif</small></div><div className="hero-metric"><span>Indikator</span><b>21</b><small>terpetakan</small></div></div><div className="hero-dashboard__footer"><span>Risiko diabetes</span><b>{lite?.summary.final_diagnosis ?? "Menunggu hasil analisis"}</b><i><em /></i></div></div><span className="hero-float hero-float--one">✦ SHAP aktif</span><span className="hero-float hero-float--two">↗ Insight siap dibaca</span></div></section>
      <section className="trust-row" id="about"><div><b>253.680</b><span>sampel BRFSS</span><small>Dataset evaluasi</small></div><div><b>70 · 15 · 15</b><span>latih · validasi · uji</span><small>Pemisahan data</small></div><div><b>{modelCount ?? "—"}</b><span>model komparatif</span><small>Mengikuti respons API</small></div><div><b>SHAP</b><span>penjelasan fitur</span><small>Alasan yang transparan</small></div></section>
      <section className="screening-section" id="screening"><div className="section-intro"><span className="eyebrow">01 · INPUT SKRINING</span><h2>Profil kesehatan Anda</h2><p>Jawab berdasarkan kondisi yang paling sesuai. Semua kolom mengikuti skema input BRFSS backend.</p></div><div className="workspace-grid"><ScreeningForm payload={payload} loading={loading} error={error} status={status} onChange={updateField} onSubmit={runAnalysis} /><WhatIfPreview result={lite} counterfactual={counterfactual} /></div></section>
      <section className="results-section user-results-section-page" id="results"><div className="section-intro section-intro--row"><div><span className="eyebrow">02 · HASIL SKRINING</span><h2>Ini yang perlu Anda tahu</h2><p>Kami merangkum hasil dengan bahasa sederhana agar Anda tahu apa artinya dan apa yang dapat dipertimbangkan selanjutnya.</p></div><button className="button button-ghost" onClick={() => window.print()} disabled={!analysis}>Simpan ringkasan <span>↗</span></button></div><div className="results-layout"><div className="condition-list user-condition-list">{conditionKeys.map((key) => analysis?.conditions[key] ? <UserConditionCard key={key} item={analysis.conditions[key]} active={activeCondition === key} onClick={() => setActiveCondition(key)} /> : <div className="condition-placeholder" key={key}><span>Hasil {key.replaceAll("_", " ")}</span><small>Isi skrining dulu</small></div>)}</div><UserResultsPanel item={activeResult} /></div><div className="technical-link"><div><span className="eyebrow">UNTUK DOSEN & DEVELOPER</span><strong>Butuh detail model dan metrik evaluasi?</strong><p>Buka ruang teknis untuk melihat semua model, metrik validation/test, ensemble, dan penjelasan SHAP sesuai respons API.</p></div><a className="button button-ghost" href="/insights">Buka ruang teknis <span>↗</span></a></div></section>
      <footer className="site-footer"><div className="brand"><span className="brand-mark">✦</span><span>Aegis <em>XAI</em></span></div><p>Ringkasan skrining kesehatan · Evaluasi internal BRFSS · Bukan diagnosis medis</p><a href="/insights">Ruang teknis ↗</a></footer>
    </main>
  );
}
