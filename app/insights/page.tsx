"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getMetrics, predictAll } from "@/lib/api";
import type { MetricsResponse, PredictAllResponse } from "@/lib/types";
import { ConditionCard } from "@/features/analysis/ConditionCard";
import { ResultsPanel } from "@/features/analysis/ResultsPanel";
import { MetricsTable } from "@/features/metrics/MetricsTable";
import { initialPayload } from "@/features/screening/constants";

const preferredConditionOrder = ["diabetes", "hypertension", "high_cholesterol", "heart_disease", "stroke"];

function getConditionKeys(conditions: PredictAllResponse["conditions"] | null) {
  if (!conditions) return preferredConditionOrder;
  const keys = Object.keys(conditions);
  return [...preferredConditionOrder.filter((key) => keys.includes(key)), ...keys.filter((key) => !preferredConditionOrder.includes(key))];
}

export default function TechnicalInsightsPage() {
  const [analysis, setAnalysis] = useState<PredictAllResponse | null>(null);
  const [metrics, setMetrics] = useState<MetricsResponse | null>(null);
  const [activeCondition, setActiveCondition] = useState("diabetes");
  const [loading, setLoading] = useState(false);
  const [loadingMetrics, setLoadingMetrics] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getMetrics().then(setMetrics).catch((reason) => setError(reason instanceof Error ? reason.message : "Metrik belum tersedia.")).finally(() => setLoadingMetrics(false));
  }, []);

  const runSampleAnalysis = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await predictAll(initialPayload);
      setAnalysis(result);
      const firstCondition = Object.keys(result.conditions)[0];
      if (firstCondition) setActiveCondition(firstCondition);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Backend belum dapat dihubungi. Pastikan layanan API berjalan.");
    } finally {
      setLoading(false);
    }
  };

  const activeResult = analysis?.conditions[activeCondition];
  const conditionKeys = getConditionKeys(analysis?.conditions ?? null);
  const modelKeys = metrics ? Object.keys(metrics.metrics.models ?? {}).filter((key) => !key.includes(":")) : [];
  const coreModelNames = modelKeys.filter((key) => key !== "ensemble_average");
  const hasEnsemble = modelKeys.includes("ensemble_average");
  const modelCount = coreModelNames.length || analysis?.conditions[conditionKeys[0]]?.models?.length || 0;
  const modelSummary = coreModelNames.length ? `${coreModelNames.join(" · ")}${hasEnsemble ? " · ensemble" : ""}` : "Mengikuti respons API";
  const protocol = metrics?.metrics.protocol;
  const splitSummary = protocol && typeof protocol.train_fraction === "number" && typeof protocol.validation_fraction === "number" && typeof protocol.test_fraction === "number"
    ? `${protocol.train_fraction * 100} · ${protocol.validation_fraction * 100} · ${protocol.test_fraction * 100}`
    : "70 · 15 · 15";

  return (
    <main className="technical-page">
      <header className="site-header"><Link className="brand" href="/"><span className="brand-mark">✦</span><span>Aegis <em>XAI</em></span></Link><nav><Link href="/">Kembali ke skrining</Link><a href="#comparison">Perbandingan</a><a href="#metrics">Metrik</a></nav><span className="header-status"><i /> Ruang teknis</span></header>
      <section className="technical-hero"><div><span className="eyebrow">RUANG TEKNIS · DOSEN & DEVELOPER</span><h1>Audit model dengan<br /><em>konteks yang lengkap.</em></h1><p>Halaman ini menyimpan detail implementasi yang tidak perlu dibaca pengguna umum: perbandingan model, ensemble, SHAP, dan metrik validation/test yang tersedia dari API.</p><div className="technical-actions"><button className="button button-primary" onClick={runSampleAnalysis} disabled={loading}>{loading ? "Menjalankan…" : "Jalankan contoh analisis"} <span>↗</span></button><Link className="button button-ghost" href="/">Kembali ke halaman pengguna</Link></div></div><div className="technical-summary"><span>Ruang lingkup evaluasi</span><strong>{modelCount || "—"} model inti</strong><small>{modelSummary}</small><i /><strong>{splitSummary}</strong><small>training · validation · test</small></div></section>
      {error && <div className="technical-alert" role="alert">{error}</div>}
      <section className="technical-section" id="comparison"><div className="section-intro section-intro--row"><div><span className="eyebrow">01 · HASIL & PENJELASAN</span><h2>Dashboard hasil analisis</h2><p>Gunakan area ini untuk memeriksa output mentah, perbandingan model, fitur SHAP, dan model terbaik yang dikirim backend.</p></div><span className="technical-badge">Untuk evaluasi internal</span></div><div className="results-layout"><div className="condition-list">{conditionKeys.map((key) => analysis?.conditions[key] ? <ConditionCard key={key} item={analysis.conditions[key]} active={activeCondition === key} onClick={() => setActiveCondition(key)} /> : <div className="condition-placeholder" key={key}><span>{key.replaceAll("_", " ")}</span><small>Jalankan contoh analisis</small></div>)}</div><ResultsPanel item={activeResult} /></div></section>
      <section className="technical-section technical-metrics" id="metrics"><div className="section-intro"><span className="eyebrow">02 · EVALUASI MODEL</span><h2>Bagaimana model dinilai</h2><p>Validation digunakan untuk memilih model tunggal. Test hanya dibuka untuk pelaporan akhir. Ensemble rata-rata dilaporkan sebagai pembanding sistem.</p></div>{loadingMetrics ? <div className="skeleton-row"><span /><span /><span /></div> : metrics ? <MetricsTable metrics={metrics} /> : <div className="technical-alert">Metrik belum tersedia.</div>}</section>
      <footer className="site-footer"><Link className="brand" href="/"><span className="brand-mark">✦</span><span>Aegis <em>XAI</em></span></Link><p>Ruang teknis · Sumber data BRFSS · Evaluasi internal</p><Link href="/">Halaman pengguna ↗</Link></footer>
    </main>
  );
}

