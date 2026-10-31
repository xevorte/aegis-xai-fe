"use client";

import type { ChangeEvent } from "react";
import type { HealthPayload } from "@/lib/types";
import { binaryFields, dayFields, selectFields } from "./constants";

type ScreeningFormProps = {
  payload: HealthPayload;
  loading: boolean;
  error: string | null;
  status: string | null;
  onChange: (key: keyof HealthPayload, value: number) => void;
  onSubmit: () => void;
};

function numberValue(event: ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
  return Number(event.target.value);
}

export function ScreeningForm({ payload, loading, error, status, onChange, onSubmit }: ScreeningFormProps) {
  return (
    <div className="form-card">
      <div className="form-card__header">
        <div><span className="step-label">FORM 21 INDIKATOR</span><h3>Data skrining</h3></div>
        <span className="form-count">{Object.keys(payload).length} / 21</span>
      </div>

      <div className="form-section">
        <div className="form-section__title"><span>01</span><div><strong>Riwayat & gaya hidup</strong><small>Gunakan pilihan Ya atau Tidak</small></div></div>
        <div className="binary-grid">
          {binaryFields.map((field) => (
            <label className="binary-field" key={field.key}>
              <span><b>{field.label}</b><small>{field.hint}</small></span>
              <select value={payload[field.key]} onChange={(event) => onChange(field.key, numberValue(event))} aria-label={field.label}>
                <option value={1}>Ya</option><option value={0}>Tidak</option>
              </select>
            </label>
          ))}
        </div>
      </div>

      <div className="form-section">
        <div className="form-section__title"><span>02</span><div><strong>Ukuran & kondisi</strong><small>Gunakan keterangan di bawah setiap pertanyaan sebagai panduan.</small></div></div>
        <div className="input-grid">
          <label className="input-field input-field--wide"><span>BMI (indeks massa tubuh)</span><input type="number" min={10} max={60} step={0.1} value={payload.BMI} onChange={(event) => onChange("BMI", numberValue(event))} aria-label="BMI atau indeks massa tubuh" /><small>Masukkan angka BMI jika mengetahuinya. Contoh: 28,5. Rentang 10–60.</small></label>
          {selectFields.map((field) => (
            <label className="input-field" key={field.key}><span>{field.label}</span><select value={payload[field.key]} onChange={(event) => onChange(field.key, numberValue(event))} aria-label={field.label}><option value="">Pilih jawaban</option>{field.options.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}</select><small>{field.hint}</small></label>
          ))}
          {dayFields.map((field) => (
            <label className="input-field" key={field.key}><span>{field.label}</span><input type="number" min={0} max={30} value={payload[field.key]} onChange={(event) => onChange(field.key, numberValue(event))} aria-label={field.label} /><small>{field.hint}</small></label>
          ))}
          <label className="input-field"><span>Jenis kelamin</span><select value={payload.Sex} onChange={(event) => onChange("Sex", numberValue(event))} aria-label="Jenis kelamin"><option value={1}>Laki-laki</option><option value={0}>Perempuan</option></select><small>Pilih sesuai jenis kelamin pada data atau dokumen resmi Anda.</small></label>
        </div>
      </div>

      <div className="form-footer"><p><span>i</span> Skor adalah hasil evaluasi internal, bukan diagnosis medis.</p><button className="button button-primary" onClick={onSubmit} disabled={loading} aria-busy={loading}>{loading ? "Mengirim data…" : "Jalankan analisis ↗"}</button></div>
      {status && <div className="form-status" role="status" aria-live="polite">{status}</div>}
      {error && <div className="inline-alert" role="alert">{error}</div>}
    </div>
  );
}

