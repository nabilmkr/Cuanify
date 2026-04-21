<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Transaction;
use Carbon\Carbon;
use Illuminate\Http\Request;

class DashboardController extends Controller
{
    public function index(Request $request)
    {
        $request->validate([
            'month' => 'nullable|integer|between:1,12',
            'year' => 'nullable|integer|min:2020|max:2100',
        ]);

        $month = (int) $request->query('month', now()->month);
        $year = (int) $request->query('year', now()->year);
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

        $periodStart = Carbon::create($year, $month, 1)->startOfDay();
        $periodEnd = $periodStart->copy()->endOfMonth();
        $today = now()->startOfDay();
        $isCurrentPeriod = $today->gte($periodStart) && $today->lte($periodEnd);
        $trendEnd = $isCurrentPeriod ? $today : $periodEnd->copy();
        $trendStart = $trendEnd->copy()->subDays(6)->startOfDay();

        if ($trendStart->lt($periodStart)) {
            $trendStart = $periodStart->copy();
        }

        $expenseMap = Transaction::query()
            ->where('user_id', $user->id)
            ->whereHas('category', fn ($query) => $query->where('type', 'expense'))
            ->whereBetween('transaction_date', [$trendStart->toDateString(), $trendEnd->toDateString()])
            ->selectRaw('DATE(transaction_date) as tx_date, SUM(amount) as total_expense')
            ->groupBy('tx_date')
            ->pluck('total_expense', 'tx_date');

        $trendPreview = [];
        $cursor = $trendStart->copy();
        while ($cursor->lte($trendEnd)) {
            $date = $cursor->toDateString();
            $trendPreview[] = [
                'date' => $date,
                'label' => $cursor->format('D'),
                'expense' => (int) ($expenseMap[$date] ?? 0),
            ];
            $cursor->addDay();
        }

        $recentTransactions = $user->transactions()
            ->with('category:id,name,type,icon')
            ->whereMonth('transaction_date', $month)
            ->whereYear('transaction_date', $year)
            ->orderByDesc('transaction_date')
            ->orderByDesc('id')
            ->limit(5)
            ->get();

        $latestInsight = $user->insights()
            ->where('period_month', $month)
            ->where('period_year', $year)
            ->latest()
            ->first();

        return response()->json([
            'status' => 'success',
            'data' => [
                'summary' => [
                    'month' => $month,
                    'year' => $year,
                    'total_income' => (int) $income,
                    'total_expense' => (int) $expense,
                    'total_balance' => (int) ($income - $expense),
                ],
                'trend_preview' => [
                    'start_date' => $trendStart->toDateString(),
                    'end_date' => $trendEnd->toDateString(),
                    'points' => $trendPreview,
                ],
                'recent_transactions' => $recentTransactions,
                'insight_preview' => $latestInsight
                    ? [
                        'id' => $latestInsight->id,
                        'ml_prediction' => $latestInsight->ml_prediction,
                        'ai_insight' => $latestInsight->insight_text,
                        'generated_at' => $latestInsight->created_at?->toDateTimeString(),
                    ]
                    : null,
            ],
        ]);
    }
}
