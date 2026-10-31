# Aegis XAI Frontend

Frontend Next.js 16.x untuk backend FastAPI Aegis XAI. Antarmuka mengikuti proposal revisi: form skrining 21 indikator, What-If preview dan counterfactual terbatas, hasil utama dari model terbaik berdasarkan PR-AUC validation, dashboard perbandingan tiga model inti, penjelasan SHAP, empat kondisi preliminary, evaluasi metrik, dan cetak laporan melalui dialog print browser.

## Menjalankan lokal

```powershell
cd "D:\me\Kuliah 5\aegis-fe"
Copy-Item .env.example .env.local
pnpm install
pnpm dev
```

Buka `http://localhost:3000`. Backend harus berjalan di `http://localhost:8000` atau ubah `NEXT_PUBLIC_API_URL` di `.env.local`.

## Kontrak yang dipakai

- `POST /api/predict-all` untuk analisis lengkap.
- `POST /api/predict-lite` untuk preview What-If tanpa SHAP.
- `POST /api/predict-best` untuk ringkasan utama dari model terbaik berdasarkan PR-AUC validation.
- `POST /api/counterfactual` untuk simulasi perubahan satu fitur actionable pada ruang kandidat terbatas.
- `GET /api/metrics` untuk tabel validation/test.

Skor UI selalu diberi catatan bahwa nilainya adalah skor model internal, bukan probabilitas medis terkalibrasi atau diagnosis. Kondisi selain diabetes tetap ditampilkan sebagai preliminary sesuai kontrak backend.

## Pemeriksaan

```powershell
pnpm typecheck
pnpm lint
pnpm build
```
