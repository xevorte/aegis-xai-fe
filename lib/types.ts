export type Binary = 0 | 1;

export type HealthPayload = {
  HighBP: Binary;
  HighChol: Binary;
  CholCheck: Binary;
  BMI: number;
  Smoker: Binary;
  Stroke: Binary;
  HeartDiseaseorAttack: Binary;
  PhysActivity: Binary;
  Fruits: Binary;
  Veggies: Binary;
  HvyAlcoholConsump: Binary;
  AnyHealthcare: Binary;
  NoDocbcCost: Binary;
  GenHlth: number;
  MentHlth: number;
  PhysHlth: number;
  DiffWalk: Binary;
  Sex: Binary;
  Age: number;
  Education: number;
  Income: number;
};

export type ModelPrediction = {
  model_name: string;
  risk_probability: number;
  prediction?: string;
};

export type FeatureContribution = {
  feature: string;
  shap_value: number;
  impact_percent: number;
};

export type ExplainableAI = {
  xai_basis_model?: string;
  top_contributing_features: FeatureContribution[];
  narrative_recommendations: string[];
};

export type ModelMetadata = {
  key?: string;
  display_name?: string;
  validation_pr_auc?: number | null;
  validation_recall?: number | null;
  validation_f1_score?: number | null;
  test_pr_auc?: number | null;
  test_recall?: number | null;
  test_ece?: number | null;
  test_f1_score?: number | null;
  test_accuracy?: number | null;
  test_roc_auc?: number | null;
  decision_threshold?: number | null;
  metrics_note?: string;
};

export type ConditionBlock = {
  condition: string;
  display_name: string;
  diagnosis?: string;
  risk_percent?: number;
  score_note?: string;
  evidence_level: string;
  validated: boolean;
  disclaimer?: string;
  available?: boolean;
  error?: string;
  best_model?: ModelMetadata;
  consensus?: string;
  models?: ModelPrediction[];
  explainable_ai?: ExplainableAI;
};

export type PredictAllResponse = {
  status: string;
  input_echo: HealthPayload;
  conditions: Record<string, ConditionBlock>;
};

export type PredictLiteResponse = {
  status: string;
  summary: {
    final_diagnosis: string;
    overall_risk_score_percent: number;
    score_note: string;
    consensus_voting: string;
  };
  model_predictions: ModelPrediction[];
};

export type PredictBestResponse = {
  status: string;
  best_model: ModelMetadata & {
    risk_probability: number;
    prediction: string;
    decision_threshold?: number;
  };
  summary: {
    final_diagnosis: string;
    risk_score_percent: number;
    score_note: string;
  };
  explainable_ai?: ExplainableAI;
  disclaimer?: string;
};

export type CounterfactualResponse = {
  status: string;
  found: boolean;
  reason?: string;
  baseline_score: number;
  counterfactual_score?: number;
  target_score: number;
  changes: Array<{ feature: string; from: number; to: number }>;
  disclaimer: string;
};

export type MetricsBlock = {
  accuracy: number;
  precision: number;
  recall: number;
  f1_score: number;
  roc_auc: number | null;
  pr_auc: number | null;
  brier_score: number | null;
  ece?: number | null;
  decision_threshold?: number | null;
  confusion_matrix: number[][];
  confusion_labels?: string[];
};

export type MetricPair = { validation: MetricsBlock; test: MetricsBlock; cv?: Record<string, number | string | null> };

export type MetricsResponse = {
  status: string;
  metrics: {
    protocol?: Record<string, number | string | boolean>;
    split?: Record<string, number | boolean>;
    models?: Record<string, MetricPair>;
    best_model?: ModelMetadata & { metric_name?: string; selection_metric?: string };
  };
};
