import type { CounterfactualResponse, PredictLiteResponse } from "@/lib/types";

type WhatIfPreviewProps = { result: PredictLiteResponse | null; counterfactual: CounterfactualResponse | null };

function riskTone(value: number) {
  if (value >= 60) return "risk-high";
  if (value >= 35) return "risk-mid";
  return "risk-low";
}

export function WhatIfPreview({ result, counterfactual }: WhatIfPreviewProps) {
  const score = result?.summary.overall_risk_score_percent ?? 0;
  const modelCount = result?.model_predictions.length;
  return <aside className="preview-column"><div className="preview-card"><div className="preview-top"><span className="step-label">SIMULASI PERUBAHAN</span><span className="live-badge"><i /> Langsung</span></div><h3>Ubah input,<br /><em>lihat pergeserannya.</em></h3><p>Simulasi ringan tanpa SHAP diperbarui saat Anda mengubah data.</p><div className={`preview-score ${riskTone(score)}`}><strong>{result ? `${score.toFixed(1)}%` : "—"}</strong><span>{result?.summary.final_diagnosis ?? "Menunggu layanan"}</span></div><div className="preview-line"><span>Risiko model</span><i><em style={{ width: `${Math.min(100, score)}%` }} /></i></div>{result && <small className="preview-consensus">{result.summary.consensus_voting}</small>}<div className="preview-note">{result ? result.summary.score_note : "Jalankan backend di localhost:8000 untuk mengaktifkan preview."}</div></div><div className="method-card"><span className="method-icon">◌</span><div><strong>Bagaimana skor ini dibaca?</strong><p>{modelCount ? `${modelCount} model memberi skor masing-masing. ` : "Model memberi skor berdasarkan jawaban Anda. "}Aegis menampilkan rata-rata untuk membantu perbandingan, dengan konteks metrik validasi dan uji.</p></div></div>{counterfactual && <div className="counterfactual-card"><span className="step-label">SIMULASI TERBATAS</span><strong>{counterfactual.found ? "Perubahan kecil yang diuji" : "Belum ada perubahan yang cocok"}</strong><p>{counterfactual.found && counterfactual.changes.length > 0 ? `${counterfactual.changes[0].feature}: ${counterfactual.changes[0].from} → ${counterfactual.changes[0].to}. Skor simulasi ${counterfactual.counterfactual_score?.toFixed(1)}%.` : counterfactual.reason ?? "Model tidak menemukan kandidat pada ruang simulasi."}</p><small>{counterfactual.disclaimer}</small></div>}</aside>;
}

