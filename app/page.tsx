"use client";

import { useEffect, useState } from "react";
import {
	getCounterfactual,
	predictAll,
	predictBest,
	predictLite,
} from "@/lib/api";
import type {
	ConditionBlock,
	CounterfactualResponse,
	HealthPayload,
	PredictAllResponse,
	PredictBestResponse,
	PredictLiteResponse,
} from "@/lib/types";
import { UserConditionCard } from "@/features/analysis/UserConditionCard";
import { UserResultsPanel } from "@/features/analysis/UserResultsPanel";
import { ScreeningForm } from "@/features/screening/ScreeningForm";
import { WhatIfPreview } from "@/features/screening/WhatIfPreview";
import { initialPayload } from "@/features/screening/constants";
import { validatePayload } from "@/features/screening/validation";
import {
	readAnalysisSession,
	saveAnalysisSession,
} from "@/lib/analysisSession";

const preferredConditionOrder = [
	"diabetes",
	"hypertension",
	"high_cholesterol",
	"heart_disease",
	"stroke",
];

function getConditionKeys(conditions: PredictAllResponse["conditions"] | null) {
	if (!conditions) return preferredConditionOrder;
	const keys = Object.keys(conditions);
	return [
		...preferredConditionOrder.filter((key) => keys.includes(key)),
		...keys.filter((key) => !preferredConditionOrder.includes(key)),
	];
}

function mergePrimaryDiabetes(
	result: PredictAllResponse,
	primary: PredictBestResponse,
): PredictAllResponse {
	const diabetes = result.conditions.diabetes;
	if (!diabetes) return result;
	const bestModel = primary.best_model;
	const primaryBlock: ConditionBlock = {
		...diabetes,
		diagnosis: primary.summary.final_diagnosis,
		risk_percent: primary.summary.risk_score_percent,
		score_note: primary.summary.score_note,
		consensus: `Model utama: ${bestModel.display_name ?? bestModel.key ?? "model terbaik"}`,
		best_model: {
			...diabetes.best_model,
			...bestModel,
		},
		explainable_ai: primary.explainable_ai ?? diabetes.explainable_ai,
		disclaimer: primary.disclaimer ?? diabetes.disclaimer,
	};
	return {
		...result,
		conditions: { ...result.conditions, diabetes: primaryBlock },
	};
}

export default function HomePage() {
	const [payload, setPayload] = useState<HealthPayload>(initialPayload);
	const [analysis, setAnalysis] = useState<PredictAllResponse | null>(null);
	const [activeCondition, setActiveCondition] = useState("diabetes");
	const [lite, setLite] = useState<PredictLiteResponse | null>(null);
	const [counterfactual, setCounterfactual] =
		useState<CounterfactualResponse | null>(null);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [status, setStatus] = useState<string | null>(null);

	useEffect(() => {
		const previous = readAnalysisSession();
		if (previous) {
			setPayload(previous.payload);
			setAnalysis(previous.analysis);
			const firstCondition = Object.keys(previous.analysis.conditions)[0];
			if (firstCondition) setActiveCondition(firstCondition);
		}
	}, []);

	useEffect(() => {
		const controller = new AbortController();
		const timer = window.setTimeout(() => {
			predictLite(payload, controller.signal)
				.then(setLite)
				.catch((reason) => {
					if (
						reason instanceof DOMException &&
						reason.name === "AbortError"
					)
						return;
					setLite(null);
				});
		}, 500);
		return () => {
			window.clearTimeout(timer);
			controller.abort();
		};
	}, [payload]);

	const updateField = (key: keyof HealthPayload, value: number) =>
		setPayload((current) => ({ ...current, [key]: value }));

	const runAnalysis = async () => {
		const validationError = validatePayload(payload);
		if (validationError) {
			setError(validationError);
			setStatus(null);
			return;
		}
		setLoading(true);
		setError(null);
		setCounterfactual(null);
		setStatus("Mengirim jawaban Anda ke layanan analisis…");
		try {
			const result = await predictAll(payload);
			let displayResult = result;
			let usedPrimaryModel = false;
			try {
				const primary = await predictBest(payload);
				displayResult = mergePrimaryDiabetes(result, primary);
				usedPrimaryModel = true;
			} catch {
				// Keep the multi-condition result usable when the optional primary endpoint is unavailable.
			}
			setAnalysis(displayResult);
			saveAnalysisSession(payload, displayResult);
			const firstCondition = Object.keys(displayResult.conditions)[0];
			if (firstCondition) setActiveCondition(firstCondition);
			setStatus(
				usedPrimaryModel
					? "Analisis selesai. Ringkasan Anda sudah siap dibaca."
					: "Analisis selesai. Ringkasan Anda sudah siap dibaca dengan hasil yang tersedia.",
			);
			getCounterfactual(payload)
				.then(setCounterfactual)
				.catch(() => setCounterfactual(null));
			window.setTimeout(
				() =>
					document.getElementById("results")?.scrollIntoView({
						behavior: "smooth",
						block: "start",
					}),
				50,
			);
		} catch (reason) {
			setError(
				reason instanceof Error
					? reason.message
					: "Layanan belum dapat dihubungi. Coba lagi beberapa saat lagi.",
			);
			setStatus(null);
		} finally {
			setLoading(false);
		}
	};

	const activeResult = analysis?.conditions[activeCondition];
	const conditionKeys = getConditionKeys(analysis?.conditions ?? null);
	const answerCount = Object.keys(payload).length;

	return (
		<main>
			<header className="site-header">
				<a className="brand" href="#top">
					<span className="brand-mark">✦</span>
					<span>
						Aegis <em>XAI</em>
					</span>
				</a>
				<nav>
					<a href="#screening">Skrining</a>
					<a href="#results">Hasil</a>
					<a href="/insights">Statistik</a>
				</nav>
				<span className="header-status">
					<i /> Siap membantu Anda
				</span>
				<a className="header-cta" href="#screening">
					Mulai sekarang <span>↗</span>
				</a>
			</header>
			<section className="hero" id="top">
				<div className="hero-copy">
					<span className="eyebrow">PANDUAN SKRINING KESEHATAN</span>
					<h1>
						Setiap sinyal kesehatan,
						<br />
						<em>lebih mudah dipahami.</em>
					</h1>
					<p>
						Jawab beberapa pertanyaan sederhana, lalu dapatkan
						ringkasan yang membantu Anda memahami hal-hal yang perlu
						diperhatikan dan dibicarakan dengan tenaga kesehatan.
					</p>
					<div className="hero-actions">
						<a className="button button-primary" href="#screening">
							Mulai skrining <span>↘</span>
						</a>
						<a className="text-link" href="#about">
							Lihat cara kerja <span>→</span>
						</a>
					</div>
					<div className="hero-proof">
						<span>
							<i>✓</i> Penjelasan dengan bahasa sederhana
						</span>
						<span>
							<i>✓</i> Data tetap di layanan lokal
						</span>
					</div>
				</div>
				<div className="hero-art">
					<div className="hero-dashboard">
						<div className="hero-dashboard__top">
							<span>RINGKASAN KESEHATAN</span>
							<i>● Siap digunakan</i>
						</div>
						<div className="hero-dashboard__heading">
							<strong>
								Semua jawaban,
								<br />
								<em>dalam satu ringkasan.</em>
							</strong>
							<span>21 pertanyaan</span>
						</div>
						<div className="hero-dashboard__grid">
							<div className="hero-metric hero-metric--wide">
								<span>Skor skrining</span>
								{lite ? (
									<b>
										{lite.summary.overall_risk_score_percent.toFixed(
											1,
										)}
										<small>%</small>
									</b>
								) : (
									<b>—</b>
								)}
								<i className="hero-sparkline">
									<em />
									<em />
									<em />
									<em />
									<em />
									<em />
									<em />
								</i>
							</div>
							<div className="hero-metric">
								<span>Jawaban</span>
								<b>{answerCount}</b>
								<small>pertanyaan</small>
							</div>
							<div className="hero-metric">
								<span>Ringkasan</span>
								<b>01</b>
								<small>untuk Anda</small>
							</div>
						</div>
						<div className="hero-dashboard__footer">
							<span>Hasil skrining</span>
							<b>
								{lite?.summary.final_diagnosis ??
									"Menunggu jawaban Anda"}
							</b>
							<i>
								<em />
							</i>
						</div>
					</div>
					<span className="hero-float hero-float--one">
						✦ Mudah dipahami
					</span>
					<span className="hero-float hero-float--two">
						↗ Ringkasan siap dibaca
					</span>
				</div>
			</section>
			<section className="trust-row" id="about">
				<div>
					<b>21</b>
					<span>pertanyaan singkat</span>
					<small>Diisi sesuai kondisi Anda</small>
				</div>
				<div>
					<b>01</b>
					<span>ringkasan pribadi</span>
					<small>Bahasa yang mudah dibaca</small>
				</div>
				<div>
					<b>100%</b>
					<span>berbasis jawaban Anda</span>
					<small>Tidak menggantikan dokter</small>
				</div>
				<div>
					<b>↗</b>
					<span>langkah berikutnya</span>
					<small>Bahan diskusi dengan tenaga kesehatan</small>
				</div>
			</section>
			<section className="screening-section" id="screening">
				<div className="section-intro">
					<span className="eyebrow">01 · JAWAB PERTANYAAN</span>
					<h2>Ceritakan kondisi Anda</h2>
					<p>
						Pilih jawaban yang paling sesuai. Setiap pertanyaan
						dilengkapi petunjuk agar mudah diikuti.
					</p>
				</div>
				<div className="workspace-grid">
					<ScreeningForm
						payload={payload}
						loading={loading}
						error={error}
						status={status}
						onChange={updateField}
						onSubmit={runAnalysis}
					/>
					<WhatIfPreview
						result={lite}
						counterfactual={counterfactual}
					/>
				</div>
			</section>
			<section
				className="results-section user-results-section-page"
				id="results"
			>
				<div className="section-intro section-intro--row">
					<div>
						<span className="eyebrow">02 · HASIL SKRINING</span>
						<h2>Ini yang perlu Anda tahu</h2>
						<p>
							Lihat ringkasan kondisi Anda dan hal-hal yang perlu
							diperhatikan.
						</p>
					</div>
					<button
						className="button button-ghost"
						onClick={() => window.print()}
						disabled={!analysis}
					>
						Simpan ringkasan <span>↗</span>
					</button>
				</div>
				<div className="results-layout">
					<div className="condition-list user-condition-list">
						{conditionKeys.map((key) =>
							analysis?.conditions[key] ? (
								<UserConditionCard
									key={key}
									item={analysis.conditions[key]}
									active={activeCondition === key}
									onClick={() => setActiveCondition(key)}
								/>
							) : (
								<div
									className="condition-placeholder"
									key={key}
								>
									<span>
										Hasil {key.replaceAll("_", " ")}
									</span>
									<small>Isi skrining dulu</small>
								</div>
							),
						)}
					</div>
					<UserResultsPanel item={activeResult} />
				</div>
				<div className="technical-link">
					<div>
						<strong>Ingin melihat penjelasan lebih lengkap?</strong>
						<p>
							Halaman khusus dosen dan developer berisi cara kerja
							sistem, perbandingan hasil, dan evaluasi penelitian.
						</p>
					</div>
					<a className="button button-ghost" href="/insights">
						Buka ruang teknis <span>↗</span>
					</a>
				</div>
			</section>
			<footer className="site-footer">
				<div className="brand">
					<span className="brand-mark">✦</span>
					<span>
						Aegis <em>XAI</em>
					</span>
				</div>
				<p>Ringkasan skrining kesehatan · Bukan diagnosis medis</p>
				<a href="/insights">Ruang teknis ↗</a>
			</footer>
		</main>
	);
}
