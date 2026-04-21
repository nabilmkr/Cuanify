/**
 * CUANIFY — TypeScript Interface Definitions
 * Maps 1-to-1 dengan response API Laravel
 */

// ─── Auth ────────────────────────────────────────────────────────────────────

export interface User {
  id: number;
  name: string;
  email: string;
  avatar_url: string | null;
  google_id: string | null;
  notifications_enabled: boolean;
}

// ─── Category ────────────────────────────────────────────────────────────────

export type CategoryType = 'income' | 'expense';

export interface Category {
  id: number;
  name: string;
  type: CategoryType;
}

// ─── Transaction ─────────────────────────────────────────────────────────────

export interface Transaction {
  id: number;
  user_id: number;
  category_id: number;
  amount: number;
  transaction_date: string;
  note: string | null;
  category?: Category;
}

// ─── Dashboard ───────────────────────────────────────────────────────────────

export interface DashboardSummary {
  total_balance: number;
  total_income: number;
  total_expense: number;
}

export interface TrendPoint {
  date?: string;
  bucket?: string;
  label: string;
  income?: number;
  expense: number;
}

export interface TrendPreview {
  points: TrendPoint[];
}

export interface InsightPreview {
  ai_insight: string | null;
  ml_prediction: string | null;
}

export interface DashboardData {
  summary: DashboardSummary;
  recent_transactions: Transaction[];
  trend_preview?: TrendPreview;
  insight_preview?: InsightPreview;
}

// ─── Analytics ───────────────────────────────────────────────────────────────

export interface TrendData {
  start_date: string;
  end_date: string;
  points: TrendPoint[];
}

export interface CategoryDistributionItem {
  category_id: number;
  name: string;
  total: number;
  percentage: number;
}

export interface CategoryDistributionData {
  total_expense: number;
  categories: CategoryDistributionItem[];
}

// ─── Insight ─────────────────────────────────────────────────────────────────

export interface InsightData {
  insight_id: number;
  user_id: number;
  month: number;
  year: number;
  ml_prediction: string | null;
  ai_insight: string | null;
  data_analyzed: {
    income: number;
    expense: number;
    savings: number;
  };
  generated_at: string;
}

// ─── Generic API Response ────────────────────────────────────────────────────

export interface ApiResponse<T> {
  status: 'success' | 'error';
  data: T;
  message?: string;
}

// ─── Profile ─────────────────────────────────────────────────────────────────

export interface ProfileUpdatePayload {
  name: string;
  avatar_url: string | null;
}

// ─── New Transaction ─────────────────────────────────────────────────────────

export interface CreateTransactionPayload {
  category_id: number;
  amount: number;
  transaction_date: string;
  note?: string;
}
