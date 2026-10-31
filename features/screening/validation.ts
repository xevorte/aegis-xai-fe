import type { HealthPayload } from "@/lib/types";

export function validatePayload(payload: HealthPayload): string | null {
  if (!Number.isFinite(payload.BMI) || payload.BMI < 10 || payload.BMI > 60) {
    return "Isi BMI dengan angka antara 10 dan 60.";
  }
  if (payload.GenHlth < 1 || payload.GenHlth > 5) return "Pilih kondisi kesehatan umum Anda.";
  if (payload.Age < 1 || payload.Age > 13) return "Pilih kelompok usia Anda.";
  if (payload.Education < 1 || payload.Education > 6) return "Pilih pendidikan terakhir Anda.";
  if (payload.Income < 1 || payload.Income > 8) return "Pilih kategori pendapatan rumah tangga.";
  if (payload.MentHlth < 0 || payload.MentHlth > 30 || payload.PhysHlth < 0 || payload.PhysHlth > 30) {
    return "Jumlah hari kesehatan harus berada di antara 0 dan 30.";
  }
  return null;
}
