import type { ConditionBlock } from "@/lib/types";

type ConditionCardProps = { item: ConditionBlock; active: boolean; onClick: () => void };

function riskTone(value: number) {
  if (value >= 60) return "risk-high";
  if (value >= 35) return "risk-mid";
  return "risk-low";
}

export function ConditionCard({ item, active, onClick }: ConditionCardProps) {
  const risk = item.risk_percent ?? 0;
  return <button className={`condition-card ${active ? "is-active" : ""}`} onClick={onClick} type="button"><span className="condition-card__top"><span className="condition-icon">{item.condition === "diabetes" ? "✦" : "•"}</span><span><strong>{item.display_name}</strong><small>{item.evidence_level === "internal_evaluation" ? "Evaluasi internal" : "Pendahuluan"}</small></span><span className={`status-dot ${riskTone(risk)}`} /></span>{item.available === false ? <span className="condition-unavailable">Model belum tersedia</span> : <><span className="condition-risk"><b>{risk.toFixed(1)}%</b><span>{item.diagnosis}</span></span><span className="mini-progress"><i style={{ width: `${Math.min(100, Math.max(0, risk))}%` }} /></span></>}</button>;
}

