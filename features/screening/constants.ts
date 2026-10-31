import type { HealthPayload } from "@/lib/types";

export const initialPayload: HealthPayload = {
  HighBP: 1,
  HighChol: 1,
  CholCheck: 1,
  BMI: 28.5,
  Smoker: 0,
  Stroke: 0,
  HeartDiseaseorAttack: 0,
  PhysActivity: 1,
  Fruits: 1,
  Veggies: 1,
  HvyAlcoholConsump: 0,
  AnyHealthcare: 1,
  NoDocbcCost: 0,
  GenHlth: 3,
  MentHlth: 2,
  PhysHlth: 1,
  DiffWalk: 0,
  Sex: 1,
  Age: 9,
  Education: 4,
  Income: 6,
};

export const binaryFields: Array<{ key: keyof HealthPayload; label: string; hint: string }> = [
  { key: "HighBP", label: "Tekanan darah tinggi", hint: "Pilih Ya jika dokter atau tenaga kesehatan pernah mengatakan tekanan darah Anda tinggi." },
  { key: "HighChol", label: "Kolesterol tinggi", hint: "Pilih Ya jika Anda pernah diberi tahu bahwa kolesterol Anda tinggi." },
  { key: "CholCheck", label: "Pemeriksaan kolesterol", hint: "Pilih Ya jika kolesterol pernah diperiksa dalam 5 tahun terakhir." },
  { key: "Smoker", label: "Merokok", hint: "Pilih Ya jika Anda sekarang merokok atau pernah merokok." },
  { key: "Stroke", label: "Riwayat stroke", hint: "Pilih Ya jika Anda pernah mengalami stroke." },
  { key: "HeartDiseaseorAttack", label: "Penyakit jantung", hint: "Pilih Ya jika pernah didiagnosis penyakit jantung atau mengalami serangan jantung." },
  { key: "PhysActivity", label: "Aktivitas fisik", hint: "Pilih Ya jika dalam 30 hari terakhir Anda berolahraga atau aktif bergerak." },
  { key: "Fruits", label: "Konsumsi buah", hint: "Pilih Ya jika biasanya makan buah setidaknya sekali sehari." },
  { key: "Veggies", label: "Konsumsi sayur", hint: "Pilih Ya jika biasanya makan sayur setidaknya sekali sehari." },
  { key: "HvyAlcoholConsump", label: "Konsumsi alkohol berat", hint: "Pilih Ya jika konsumsi alkohol Anda termasuk sering atau banyak." },
  { key: "AnyHealthcare", label: "Akses layanan kesehatan", hint: "Pilih Ya jika memiliki fasilitas atau jaminan untuk berobat." },
  { key: "NoDocbcCost", label: "Terkendala biaya berobat", hint: "Pilih Ya jika dalam setahun terakhir tidak berobat karena biaya." },
  { key: "DiffWalk", label: "Kesulitan berjalan", hint: "Pilih Ya jika sulit berjalan atau menaiki tangga karena kondisi kesehatan." },
];

type SelectField = { key: keyof HealthPayload; label: string; hint: string; options: Array<{ value: number; label: string }> };

export const selectFields: SelectField[] = [
  { key: "GenHlth", label: "Kesehatan umum", hint: "Nilai 1 berarti kondisi paling baik, 5 paling buruk.", options: [1, 2, 3, 4, 5].map((value) => ({ value, label: `${value} · ${["Sangat baik", "Baik", "Cukup", "Buruk", "Sangat buruk"][value - 1]}` })) },
  { key: "Age", label: "Kelompok usia", hint: "Pilih kelompok usia Anda saat ini.", options: ["18–24", "25–29", "30–34", "35–39", "40–44", "45–49", "50–54", "55–59", "60–64", "65–69", "70–74", "75–79", "80 tahun atau lebih"].map((label, index) => ({ value: index + 1, label })) },
  { key: "Education", label: "Pendidikan terakhir", hint: "Pilih tingkat pendidikan yang sudah selesai Anda tempuh.", options: ["Belum sekolah", "Kelas 1–8", "Kelas 9–11", "Lulus SMA", "Kuliah sebagian / diploma", "Lulus perguruan tinggi"].map((label, index) => ({ value: index + 1, label })) },
  { key: "Income", label: "Pendapatan rumah tangga", hint: "Pilih perkiraan pendapatan kotor rumah tangga dalam satu tahun. Gunakan kategori yang paling mendekati.", options: ["Di bawah Rp150 juta", "Rp150–225 juta", "Rp225–300 juta", "Rp300–375 juta", "Rp375–525 juta", "Rp525–750 juta", "Rp750 juta–1,125 miliar", "Rp1,125 miliar atau lebih"].map((label, index) => ({ value: index + 1, label })) },
];

export const dayFields: Array<{ key: keyof HealthPayload; label: string; hint: string }> = [
  { key: "MentHlth", label: "Hari kesehatan mental", hint: "Berapa hari dalam 30 hari terakhir Anda merasa stres, sedih, atau kurang sehat secara mental? Isi 0–30." },
  { key: "PhysHlth", label: "Hari kesehatan fisik", hint: "Berapa hari dalam 30 hari terakhir kondisi fisik mengganggu aktivitas Anda? Isi 0–30." },
];

