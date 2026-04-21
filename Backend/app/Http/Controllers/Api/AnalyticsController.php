<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Transaction;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class AnalyticsController extends Controller
{
    public function summary(Request $request)
    {
        // Validasi query parameter agar tidak bisa diinject sembarang string
        $request->validate([
            'month' => 'nullable|integer|between:1,12',
            'year'  => 'nullable|integer|min:2020|max:2100',
        ]);

        $month  = $request->query('month', date('m'));
        $year   = $request->query('year', date('Y'));
        $userId = $request->user()->id;

        // Query efisien: Lakukan agregasi (SUM) langsung di level Database MySQL
        $income = Transaction::where('user_id', $userId)
            ->whereHas('category', fn ($q) => $q->where('type', 'income'))
            ->whereMonth('transaction_date', $month)
            ->whereYear('transaction_date', $year)
            ->sum('amount');

        $expense = Transaction::where('user_id', $userId)
            ->whereHas('category', fn ($q) => $q->where('type', 'expense'))
            ->whereMonth('transaction_date', $month)
            ->whereYear('transaction_date', $year)
            ->sum('amount');

        return response()->json([
            'status' => 'success',
            'data'   => [
                'total_income'  => (int) $income,
                'total_expense' => (int) $expense,
                'total_balance' => (int) ($income - $expense),
            ]
        ]);
    }

    public function trend(Request $request)
    {
        $request->validate([
            'range' => 'nullable|in:week,month,year',
            'anchor_date' => 'nullable|date',
            'month' => 'nullable|integer|between:1,12',
            'year' => 'nullable|integer|min:2020|max:2100',
        ]);

        $range = $request->query('range', 'month');
        [$start, $end, $labels] = $this->resolveRange($request, $range);

        [$bucketExpr, $bucketType] = $this->resolveBucketExpression($range);

        $rows = Transaction::query()
            ->join('categories', 'transactions.category_id', '=', 'categories.id')
            ->where('transactions.user_id', $request->user()->id)
            ->whereBetween('transactions.transaction_date', [$start->toDateString(), $end->toDateString()])
            ->selectRaw($bucketExpr.' as bucket')
            ->selectRaw("SUM(CASE WHEN categories.type = 'income' THEN transactions.amount ELSE 0 END) as total_income")
            ->selectRaw("SUM(CASE WHEN categories.type = 'expense' THEN transactions.amount ELSE 0 END) as total_expense")
            ->groupBy('bucket')
            ->orderBy('bucket')
            ->get();

        $map = [];
        foreach ($rows as $row) {
            $map[(string) $row->bucket] = [
                'income' => (int) $row->total_income,
                'expense' => (int) $row->total_expense,
            ];
        }

        $points = [];
        foreach ($labels as $label) {
            $bucket = $label['bucket'];
            $income = $map[$bucket]['income'] ?? 0;
            $expense = $map[$bucket]['expense'] ?? 0;

            $points[] = [
                'bucket' => $bucket,
                'label' => $label['label'],
                'date' => $label['date'],
                'income' => $income,
                'expense' => $expense,
                'balance' => $income - $expense,
            ];
        }

        return response()->json([
            'status' => 'success',
            'data' => [
                'range' => $range,
                'bucket_type' => $bucketType,
                'start_date' => $start->toDateString(),
                'end_date' => $end->toDateString(),
                'points' => $points,
            ],
        ]);
    }

    public function categoryDistribution(Request $request)
    {
        $request->validate([
            'range' => 'nullable|in:week,month,year',
            'anchor_date' => 'nullable|date',
            'month' => 'nullable|integer|between:1,12',
            'year' => 'nullable|integer|min:2020|max:2100',
        ]);

        $range = $request->query('range', 'month');
        [$start, $end] = $this->resolveRange($request, $range);

        $rows = Transaction::query()
            ->join('categories', 'transactions.category_id', '=', 'categories.id')
            ->where('transactions.user_id', $request->user()->id)
            ->whereBetween('transactions.transaction_date', [$start->toDateString(), $end->toDateString()])
            ->where('categories.type', 'expense')
            ->select('categories.id as category_id', 'categories.name', 'categories.icon')
            ->selectRaw('SUM(transactions.amount) as total_amount')
            ->groupBy('categories.id', 'categories.name', 'categories.icon')
            ->orderByDesc('total_amount')
            ->get();

        $totalExpense = (int) $rows->sum('total_amount');

        $distribution = $rows->map(function ($row) use ($totalExpense) {
            $amount = (int) $row->total_amount;
            $percentage = $totalExpense > 0
                ? round(($amount / $totalExpense) * 100, 2)
                : 0.0;

            return [
                'category_id' => (int) $row->category_id,
                'name' => $row->name,
                'icon' => $row->icon,
                'amount' => $amount,
                'percentage' => $percentage,
            ];
        })->values();

        return response()->json([
            'status' => 'success',
            'data' => [
                'range' => $range,
                'start_date' => $start->toDateString(),
                'end_date' => $end->toDateString(),
                'total_expense' => $totalExpense,
                'categories' => $distribution,
            ],
        ]);
    }

    private function resolveRange(Request $request, string $range): array
    {
        if ($range === 'week') {
            $anchor = Carbon::parse($request->query('anchor_date', now()->toDateString()));
            $start = $anchor->copy()->startOfWeek(Carbon::MONDAY);
            $end = $anchor->copy()->endOfWeek(Carbon::SUNDAY);
            $labels = [];

            for ($i = 0; $i < 7; $i++) {
                $day = $start->copy()->addDays($i);
                $labels[] = [
                    'bucket' => $day->toDateString(),
                    'label' => $day->format('D'),
                    'date' => $day->toDateString(),
                ];
            }

            return [$start, $end, $labels];
        }

        if ($range === 'year') {
            $year = (int) $request->query('year', now()->year);
            $start = Carbon::create($year, 1, 1)->startOfDay();
            $end = Carbon::create($year, 12, 31)->endOfDay();
            $labels = [];

            for ($month = 1; $month <= 12; $month++) {
                $date = Carbon::create($year, $month, 1);
                $labels[] = [
                    'bucket' => $date->format('m'),
                    'label' => $date->format('M'),
                    'date' => $date->toDateString(),
                ];
            }

            return [$start, $end, $labels];
        }

        $month = (int) $request->query('month', now()->month);
        $year = (int) $request->query('year', now()->year);
        $start = Carbon::create($year, $month, 1)->startOfDay();
        $end = $start->copy()->endOfMonth()->endOfDay();
        $labels = [];

        for ($day = 1; $day <= $start->daysInMonth; $day++) {
            $date = Carbon::create($year, $month, $day);
            $labels[] = [
                'bucket' => $date->toDateString(),
                'label' => (string) $day,
                'date' => $date->toDateString(),
            ];
        }

        return [$start, $end, $labels];
    }

    private function resolveBucketExpression(string $range): array
    {
        $driver = DB::connection()->getDriverName();

        if ($range === 'year') {
            if ($driver === 'sqlite') {
                return ["strftime('%m', transactions.transaction_date)", 'month'];
            }

            return ['LPAD(MONTH(transactions.transaction_date), 2, "0")', 'month'];
        }

        if ($driver === 'sqlite') {
            return ["date(transactions.transaction_date)", 'day'];
        }

        return ['DATE(transactions.transaction_date)', 'day'];
    }
}
