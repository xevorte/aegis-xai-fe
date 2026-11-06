import type { CounterfactualResponse, PredictLiteResponse } from "@/lib/types";

type WhatIfPreviewProps = { result: PredictLiteResponse | null; counterfactual: CounterfactualResponse | null };

function riskTone(value: number) {
  if (value >= 60) return "risk-high";
  if (value >= 35) return "risk-mid";
  return "risk-low";
}

export function WhatIfPreview({ result, counterfactual }: WhatIfPreviewProps) {
  const score = result?.summary.overall_risk_score_percent ?? 0;
  return <aside className="preview-column"><div className="preview-card"><div className="preview-top"><span className="step-label">COBA PERUBAHAN</span><span className="live-badge"><i /> Langsung</span></div><h3>Ubah jawaban,<br /><em>lihat perbedaannya.</em></h3><p>Ubah isian untuk melihat gambaran skor secara langsung.</p><div className={`preview-score ${riskTone(score)}`}><strong>{result ? `${score.toFixed(1)}%` : "—"}</strong><span>{result?.summary.final_diagnosis ?? "Menunggu jawaban"}</span></div><div className="preview-line"><span>Gambaran skor</span><i><em style={{ width: `${Math.min(100, score)}%` }} /></i></div>{result && <small className="preview-consensus">Ringkasan diperbarui berdasarkan jawaban Anda.</small>}<div className="preview-note">{result ? "Angka ini membantu membaca pola jawaban Anda, bukan diagnosis." : "Isi pertanyaan untuk melihat gambaran skor."}</div></div><div className="method-card"><span className="method-icon">◌</span><div><strong>Bagaimana hasil ini dibaca?</strong><p>Jawaban Anda dirangkum menjadi satu gambaran. Gunakan hasil ini sebagai bahan diskusi dengan tenaga kesehatan.</p></div></div>{counterfactual && <div className="counterfactual-card"><span className="step-label">CONTOH PERUBAHAN</span><strong>{counterfactual.found ? "Ada perubahan yang bisa dicoba" : "Belum ada contoh perubahan"}</strong><p>{counterfactual.found && counterfactual.changes.length > 0 ? `${counterfactual.changes[0].feature}: ${counterfactual.changes[0].from} → ${counterfactual.changes[0].to}. Gambaran skor menjadi ${counterfactual.counterfactual_score?.toFixed(1)}%.` : counterfactual.reason ?? "Belum ada contoh yang sesuai dengan jawaban Anda."}</p><small>{counterfactual.disclaimer}</small></div>}</aside>;
}

