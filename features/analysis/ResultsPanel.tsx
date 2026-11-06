import type { ConditionBlock } from "@/lib/types";

type ResultsPanelProps = { item: ConditionBlock | undefined };

function formatMetric(value: number | null | undefined, digits = 2) {
  return value === null || value === undefined ? "—" : value.toFixed(digits);
}

function riskTone(value: number) {
  if (value >= 60) return "risk-high";
  if (value >= 35) return "risk-mid";
  return "risk-low";
}

function scoreMethod(item: ConditionBlock) {
  if (item.condition === "diabetes") {
    return item.best_model?.display_name
      ? `Diabetes: skor dari ${item.best_model.display_name}, model terbaik berdasarkan PR-AUC validation.`
      : "Diabetes: skor dari model utama yang dipilih pada data validation.";
  }
  return `${item.display_name}: skor dari model kondisi yang tersedia pada backend. Kondisi ini bersifat preliminary.`;
}

export function ResultsPanel({ item }: ResultsPanelProps) {
  if (!item) return <div className="empty-panel"><span className="empty-mark">↗</span><h3>Hasil akan muncul di sini</h3><p>Isi data skrining lalu jalankan analisis untuk melihat skor dan penjelasan model.</p></div>;
  const risk = item.risk_percent ?? 0;
 return <div className="results-panel"><div className="result-heading"><div><span className="eyebrow">HASIL ANALISIS · {item.evidence_level === "internal_evaluation" ? "INTERNAL" : "PENDAHULUAN"}</span><h2>{item.display_name}</h2></div><span className={`risk-pill ${riskTone(risk)}`}>{item.diagnosis ?? "Belum tersedia"}</span></div>{item.available === false ? <div className="inline-alert">{item.error}</div> : <><div className="score-layout"><div className={`score-ring ${riskTone(risk)}`} style={{ background: `conic-gradient(var(--green) 0 ${Math.min(100, Math.max(0, risk))}%, var(--line) ${Math.min(100, Math.max(0, risk))}% 100%)` }}><span>{risk.toFixed(1)}<small>%</small></span></div><div className="score-copy"><strong>Skor model</strong><p>{item.score_note ?? "Skor ini bukan probabilitas medis terkalibrasi."}</p><span>{item.consensus}</span></div></div>{item.models && <section className="result-section"><div className="section-label"><span>01</span><h3>Perbandingan metode</h3></div><div className="model-list">{item.models.map((model) => <div className="model-row" key={model.model_name}><span>{model.model_name}</span><b>{model.risk_probability.toFixed(1)}%</b><i><em style={{ width: `${Math.min(100, model.risk_probability)}%` }} /></i></div>)}</div></section>}<section className="calculation-note"><div className="section-label"><span>i</span><h3>Cara angka ini dihitung</h3></div><p><strong>Persentase ringkasan:</strong> keluaran probabilitas model dikalikan 100. Contoh, keluaran 0,032 menjadi 3,2%. Ini skor dari pola data, bukan peluang medis pasti.</p><p><strong>Persentase faktor:</strong> nilai absolut SHAP tiap fitur dibagi jumlah nilai absolut SHAP semua fitur, lalu dikalikan 100. Jadi, 25,0% berarti fitur itu menyumbang sekitar seperempat dari penjelasan model pada jawaban ini, bukan menaikkan risiko sebesar 25 poin.</p><p className="calculation-source">{scoreMethod(item)}</p></section>{item.explainable_ai && <section className="result-section"><div className="section-label"><span>02</span><h3>Penjelasan XAI</h3></div><p className="section-note">Kontribusi relatif fitur dari {item.explainable_ai.xai_basis_model ?? "model penjelas"}; bukan hubungan sebab-akibat.</p><div className="feature-list">{item.explainable_ai.top_contributing_features.slice(0, 5).map((feature) => <div className="feature-row" key={feature.feature}><span>{feature.feature}<small className="feature-shap-value">SHAP {feature.shap_value.toFixed(4)}</small></span><b>{feature.impact_percent.toFixed(1)}%</b><i><em style={{ width: `${Math.min(100, feature.impact_percent)}%` }} /></i></div>)}</div><div className="recommendations">{item.explainable_ai.narrative_recommendations.slice(0, 3).map((text) => <p key={text}>↳ {text}</p>)}</div></section>}{item.best_model && <section className="result-section metadata"><div className="section-label"><span>03</span><h3>Keandalan internal</h3></div><div className="metric-strip"><div><small>Metode terbaik</small><strong>{item.best_model.display_name ?? "—"}</strong></div><div><small>PR-AUC validasi</small><strong>{formatMetric(item.best_model.validation_pr_auc)}</strong></div><div><small>PR-AUC uji</small><strong>{formatMetric(item.best_model.test_pr_auc)}</strong></div><div><small>ECE uji</small><strong>{formatMetric(item.best_model.test_ece)}</strong></div></div></section>}<p className="disclaimer">{item.disclaimer}</p></>}</div>;
}


