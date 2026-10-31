import type { MetricPair, MetricsResponse } from "@/lib/types";

type MetricsTableProps = { metrics: MetricsResponse };

function formatMetric(value: number | null | undefined) {
  return value === null || value === undefined ? "—" : value.toFixed(2);
}

function modelLabel(key: string) {
  const labels: Record<string, string> = {
    rf: "Random Forest",
    xgb: "Gradient Boosting (XGBoost)",
    cnn1d: "1D-CNN (Deep Learning)",
    ensemble_average: "Rata-rata gabungan",
  };
  return labels[key] ?? key.replaceAll("_", " ");
}

function splitLabel(metrics: MetricsResponse) {
  const protocol = metrics.metrics.protocol;
  if (!protocol) return "Pembagian data mengikuti konfigurasi backend";
  const train = typeof protocol.train_fraction === "number" ? `${protocol.train_fraction * 100}% latih` : "latih";
  const validation = typeof protocol.validation_fraction === "number" ? `${protocol.validation_fraction * 100}% validasi` : "validasi";
  const test = typeof protocol.test_fraction === "number" ? `${protocol.test_fraction * 100}% uji` : "uji";
  return `${train} · ${validation} · ${test}`;
}

export function MetricsTable({ metrics }: MetricsTableProps) {
  const rows = Object.entries(metrics.metrics.models ?? {}).filter(([key]) => !key.includes(":"));
  const bestKey = metrics.metrics.best_model?.metric_name ?? metrics.metrics.best_model?.key;
  return <div className="metrics-table-wrap"><div className="metrics-meta"><span>Split aktif</span><b>{splitLabel(metrics)}</b><span className="metrics-note">PR-AUC · ROC-AUC · ECE</span></div><div className="metrics-table"><div className="metrics-row metrics-row--head"><span>Model</span><span>PR-AUC validasi</span><span>PR-AUC uji</span><span>ROC-AUC uji</span><span>ECE uji</span></div>{rows.map(([key, pair]: [string, MetricPair]) => <div className="metrics-row" key={key}><span><b>{modelLabel(key)}</b>{key === bestKey && <small>Model terbaik</small>}</span><span>{formatMetric(pair.validation?.pr_auc)}</span><span>{formatMetric(pair.test?.pr_auc)}</span><span>{formatMetric(pair.test?.roc_auc)}</span><span>{formatMetric(pair.test?.ece)}</span></div>)}</div></div>;
}

