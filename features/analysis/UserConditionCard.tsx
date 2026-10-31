import type { ConditionBlock } from "@/lib/types";

type UserConditionCardProps = {
  item: ConditionBlock;
  active: boolean;
  onClick: () => void;
};

function riskTone(value: number) {
  if (value >= 60) return "risk-high";
  if (value >= 35) return "risk-mid";
  return "risk-low";
}

function riskLabel(value: number) {
  if (value >= 60) return "Perlu diperhatikan";
  if (value >= 35) return "Perlu dipantau";
  return "Cenderung rendah";
}

export function UserConditionCard({ item, active, onClick }: UserConditionCardProps) {
  const risk = item.risk_percent ?? 0;
  const label = item.available === false ? "Belum tersedia" : riskLabel(risk);

  return (
    <button className={`user-condition-card ${active ? "is-active" : ""}`} onClick={onClick} type="button">
      <span className="user-condition-card__top">
        <span className="condition-icon">{item.condition === "diabetes" ? "✦" : "•"}</span>
        <span>
          <strong>{item.display_name}</strong>
          <small>Ringkasan skrining</small>
        </span>
        <span className={`status-dot ${riskTone(risk)}`} />
      </span>
      <span className="user-condition-card__score">
        <b>{item.available === false ? "—" : `${risk.toFixed(1)}%`}</b>
        <span>{label}</span>
      </span>
      <span className="mini-progress"><i style={{ width: `${Math.min(100, Math.max(0, risk))}%` }} /></span>
    </button>
  );
}
