<?php

namespace App\Http\Controllers;

use App\Models\Transaction;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;

class AiInsightController extends Controller
{
    public function getInsight(Request $request)
    {
        $request->validate([
            'month' => 'nullable|integer|between:1,12',
            'year' => 'nullable|integer|min:2020|max:2100',
        ]);

        $month = (int) $request->input('month', now()->month);
        $year = (int) $request->input('year', now()->year);
        $user = $request->user();

        $insight = $user->insights()
            ->where('period_month', $month)
            ->where('period_year', $year)
            ->latest()
            ->first();

        if (! $insight) {
            return response()->json([
                'status' => 'success',
                'requires_refresh' => true,
                'message' => 'Insight belum tersedia. Gunakan endpoint refresh untuk membuat insight baru.',
                'data' => [
                    'month' => $month,
                    'year' => $year,
                ],
            ]);
        }

        return response()->json([
            'status' => 'success',
            'requires_refresh' => false,
            'data' => [
                'insight_id' => $insight->id,
                'user_id' => $user->id,
                'month' => $month,
                'year' => $year,
                'ml_prediction' => $insight->ml_prediction,
                'ai_insight' => $insight->insight_text,
                'data_analyzed' => $insight->data_analyzed,
                'generated_at' => $insight->created_at?->toDateTimeString(),
            ],
        ]);
    }

    public function refreshInsight(Request $request)
    {
        $request->validate([
            'month' => 'nullable|integer|between:1,12',
            'year' => 'nullable|integer|min:2020|max:2100',
        ]);

        $month = (int) $request->input('month', now()->month);
        $year = (int) $request->input('year', now()->year);
        $user = $request->user();

        $income = Transaction::where('user_id', $user->id)
            ->whereHas('category', fn ($query) => $query->where('type', 'income'))
            ->whereMonth('transaction_date', $month)
            ->whereYear('transaction_date', $year)
            ->sum('amount');

        $expense = Transaction::where('user_id', $user->id)
            ->whereHas('category', fn ($query) => $query->where('type', 'expense'))
            ->whereMonth('transaction_date', $month)
            ->whereYear('transaction_date', $year)
            ->sum('amount');

        $payload = [
            'user_id' => $user->id,
            'total_income' => (int) $income,
            'total_expense' => (int) $expense,
            'savings' => (int) ($income - $expense),
        ];

        if ($payload['total_income'] === 0 && $payload['total_expense'] === 0) {
            return response()->json([
                'status' => 'success',
                'requires_data' => true,
                'message' => 'Belum ada transaksi pada periode ini.',
                'data' => [
                    'month' => $month,
                    'year' => $year,
                    'data_analyzed' => $payload,
                ],
            ]);
        }

        $aiServiceUrl = config('services.ai.service_url', 'http://127.0.0.1:8001');

        try {
            $response = Http::timeout(20)->post(rtrim($aiServiceUrl, '/').'/api/predict', $payload);

            if (! $response->successful()) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Gagal memproses analisis AI.',
                    'details' => $response->json(),
                ], $response->status());
            }

            $body = $response->json();
            $insight = $user->insights()->create([
                'period_month' => $month,
                'period_year' => $year,
                'insight_text' => (string) ($body['ai_insight'] ?? ''),
                'recommendations' => $body['recommendations'] ?? null,
                'ml_prediction' => $body['ml_prediction'] ?? null,
                'data_analyzed' => $body['data_analyzed'] ?? $payload,
            ]);

            return response()->json([
                'status' => 'success',
                'message' => 'Insight berhasil diperbarui.',
                'data' => [
                    'insight_id' => $insight->id,
                    'user_id' => $user->id,
                    'month' => $month,
                    'year' => $year,
                    'ml_prediction' => $insight->ml_prediction,
                    'ai_insight' => $insight->insight_text,
                    'data_analyzed' => $insight->data_analyzed,
                    'generated_at' => $insight->created_at?->toDateTimeString(),
                ],
            ]);
        } catch (\Throwable $exception) {
            return response()->json([
                'status' => 'error',
                'message' => 'AI Service sedang offline atau tidak dapat dihubungi.',
            ], 503);
        }
    }

    public function history(Request $request)
    {
        $request->validate([
            'month' => 'nullable|integer|between:1,12',
            'year' => 'nullable|integer|min:2020|max:2100',
            'page' => 'nullable|integer|min:1',
            'per_page' => 'nullable|integer|min:1|max:50',
        ]);

        $query = $request->user()
            ->insights()
            ->orderByDesc('created_at')
            ->orderByDesc('id');

        if ($request->filled('month')) {
            $query->where('period_month', $request->integer('month'));
        }

        if ($request->filled('year')) {
            $query->where('period_year', $request->integer('year'));
        }

        $perPage = (int) $request->query('per_page', 10);
        $history = $query->paginate($perPage);

        return response()->json([
            'status' => 'success',
            'data' => [
                'items' => $history->items(),
                'pagination' => [
                    'current_page' => $history->currentPage(),
                    'last_page' => $history->lastPage(),
                    'per_page' => $history->perPage(),
                    'total' => $history->total(),
                ],
            ],
        ]);
    }
}
