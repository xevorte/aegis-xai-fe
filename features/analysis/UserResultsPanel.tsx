import type { ConditionBlock } from "@/lib/types";

type UserResultsPanelProps = { item: ConditionBlock | undefined };

function riskLabel(value: number) {
  if (value >= 60) return "Perlu diperhatikan";
  if (value >= 35) return "Perlu dipantau";
  return "Cenderung rendah";
}

function riskTone(value: number) {
  if (value >= 60) return "risk-high";
  if (value >= 35) return "risk-mid";
  return "risk-low";
}

function friendlyFeatureName(feature: string) {
  const names: Record<string, string> = {
    HighBP: "Tekanan darah",
    HighChol: "Kolesterol",
    GenHlth: "Kondisi kesehatan umum",
    BMI: "Indeks massa tubuh",
    Age: "Kelompok usia",
    DiffWalk: "Kesulitan berjalan",
    PhysActivity: "Aktivitas fisik",
    MentHlth: "Kesehatan mental",
    PhysHlth: "Kesehatan fisik",
  };
  return names[feature] ?? feature;
}

export function UserResultsPanel({ item }: UserResultsPanelProps) {
  if (!item) {
    return (
      <div className="user-empty-panel">
        <span className="empty-mark">✦</span>
        <h3>Hasil Anda akan muncul di sini</h3>
        <p>Isi pertanyaan skrining, lalu tekan “Jalankan analisis”. Kami akan menjelaskan hasilnya dengan bahasa sederhana.</p>
      </div>
    );
  }

  const risk = item.risk_percent ?? 0;
  const recommendations = item.explainable_ai?.narrative_recommendations.slice(0, 3) ?? [];
  const features = item.explainable_ai?.top_contributing_features.slice(0, 3) ?? [];

  if (item.available === false) {
    return <div className="user-empty-panel"><span className="empty-mark">!</span><h3>Hasil belum tersedia</h3><p>{item.error ?? "Model untuk kondisi ini belum tersedia."}</p></div>;
  }

  return (
    <div className="user-results-panel">
      <div className="user-results-heading">
        <div>
          <span className="eyebrow">RINGKASAN UNTUK ANDA</span>
          <h2>{item.display_name}</h2>
          <p>Ini adalah perkiraan dari pola jawaban Anda pada kuesioner. Gunakan sebagai bahan diskusi dengan tenaga kesehatan.</p>
        </div>
        <span className={`user-risk-pill ${riskTone(risk)}`}>{riskLabel(risk)}</span>
      </div>

      <div className="user-score-card">
        <div className={`user-score-ring ${riskTone(risk)}`} style={{ background: `conic-gradient(var(--green) 0 ${Math.min(100, Math.max(0, risk))}%, var(--line) ${Math.min(100, Math.max(0, risk))}% 100%)` }}>
          <span>{risk.toFixed(1)}<small>%</small></span>
        </div>
        <div>
          <strong>Apa artinya?</strong>
          <p>Semakin tinggi skor, semakin banyak pola pada jawaban Anda yang mirip dengan kelompok berisiko di data penelitian.</p>
          <span className="user-consensus">{item.consensus ?? "Hasil dirangkum dari beberapa model."}</span>
        </div>
      </div>

      <section className="user-result-section">
        <div className="user-section-title"><span>01</span><div><h3>Hal yang paling berpengaruh</h3><p>Faktor ini membantu menjelaskan mengapa skor Anda terbentuk.</p></div></div>
        {features.length > 0 ? <div className="user-feature-list">{features.map((feature) => <div className="user-feature-row" key={feature.feature}><span>{friendlyFeatureName(feature.feature)}</span><b>{feature.impact_percent.toFixed(1)}%</b><i><em style={{ width: `${Math.min(100, feature.impact_percent)}%` }} /></i></div>)}</div> : <p className="user-muted">Penjelasan faktor belum tersedia untuk kondisi ini.</p>}
      </section>

      <section className="user-result-section">
        <div className="user-section-title"><span>02</span><div><h3>Langkah yang bisa dipertimbangkan</h3><p>Saran umum untuk membantu Anda menentukan langkah berikutnya.</p></div></div>
        {recommendations.length > 0 ? <ul className="user-recommendations">{recommendations.map((recommendation) => <li key={recommendation}>{recommendation}</li>)}</ul> : <p className="user-muted">Belum ada saran tambahan.</p>}
      </section>

      <p className="user-disclaimer">Hasil ini bukan diagnosis medis dan tidak memprediksi kejadian kesehatan di masa depan. Jika Anda merasa tidak sehat atau khawatir, hubungi tenaga kesehatan.</p>
    </div>
  );
}
