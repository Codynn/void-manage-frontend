export type MarkCategory =
  | "SPRINT_CONTRIBUTION"
  | "TEAM_COLLABORATION"
  | "FEATURE_DELIVERY"
  | "FINAL_PRODUCT"
  | "CODE_DESIGN_QUALITY";

export const MARK_CATEGORY_LABELS: Record<MarkCategory, string> = {
  SPRINT_CONTRIBUTION: "Sprint Contribution",
  TEAM_COLLABORATION: "Team Collaboration",
  FEATURE_DELIVERY: "Feature Delivery",
  FINAL_PRODUCT: "Final Product",
  CODE_DESIGN_QUALITY: "Code / Design Quality",
};

export const MARK_CATEGORIES: MarkCategory[] = [
  "SPRINT_CONTRIBUTION",
  "TEAM_COLLABORATION",
  "FEATURE_DELIVERY",
  "FINAL_PRODUCT",
  "CODE_DESIGN_QUALITY",
];

export interface IMark {
  _id: string;
  intern: string;
  category: MarkCategory;
  score: number;
  markedBy: { _id: string; username: string; role: string };
  markedAt: string;
}

export interface ICategoryMark {
  category: MarkCategory;
  mark: IMark | null;
}

export interface IInternMarksSummary {
  intern: { _id: string; username: string; email: string; displayPhoto?: string };
  categories: ICategoryMark[];
  average: number | null;
}
