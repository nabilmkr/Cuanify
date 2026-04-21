<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Transaction;
use Illuminate\Http\Request;

class TransactionController extends Controller
{
    // GET /api/transactions — Daftar transaksi milik user yang login
    public function index(Request $request)
    {
        $month = $request->query('month', date('m'));
        $year  = $request->query('year', date('Y'));

        $transactions = $request->user()->transactions()
            ->with('category') // Eager loading — cegah N+1 Query
            ->whereMonth('transaction_date', $month)
            ->whereYear('transaction_date', $year)
            ->orderBy('transaction_date', 'desc')
            ->get();

        return response()->json([
            'status' => 'success',
            'data'   => $transactions
        ]);
    }

    // POST /api/transactions — Simpan transaksi baru
    public function store(Request $request)
    {
        $validated = $request->validate([
            'category_id'      => 'required|exists:categories,id',
            'amount'           => 'required|integer|min:1',
            'transaction_date' => 'required|date',
            'note'             => 'nullable|string|max:255',
        ]);

        $transaction = $request->user()->transactions()->create($validated);
        $transaction->load('category');

        return response()->json([
            'status'  => 'success',
            'message' => 'Transaksi berhasil ditambahkan',
            'data'    => $transaction
        ], 201);
    }

    // GET /api/transactions/{id} — Detail satu transaksi
    public function show(Request $request, Transaction $transaction)
    {
        // OTORISASI: pastikan transaksi ini milik user yang sedang login
        if ($transaction->user_id !== $request->user()->id) {
            return response()->json([
                'status'  => 'error',
                'message' => 'Akses ditolak.'
            ], 403);
        }

        return response()->json([
            'status' => 'success',
            'data'   => $transaction->load('category')
        ]);
    }

    // PUT/PATCH /api/transactions/{id} — Update transaksi
    public function update(Request $request, Transaction $transaction)
    {
        // OTORISASI: pastikan transaksi ini milik user yang sedang login
        if ($transaction->user_id !== $request->user()->id) {
            return response()->json([
                'status'  => 'error',
                'message' => 'Akses ditolak.'
            ], 403);
        }

        $validated = $request->validate([
            'category_id'      => 'sometimes|exists:categories,id',
            'amount'           => 'sometimes|integer|min:1',
            'transaction_date' => 'sometimes|date',
            'note'             => 'nullable|string|max:255',
        ]);

        $transaction->update($validated);

        return response()->json([
            'status'  => 'success',
            'message' => 'Transaksi berhasil diupdate',
            'data'    => $transaction->load('category')
        ]);
    }

    // DELETE /api/transactions/{id} — Hapus transaksi
    public function destroy(Request $request, Transaction $transaction)
    {
        // OTORISASI: pastikan transaksi ini milik user yang sedang login
        if ($transaction->user_id !== $request->user()->id) {
            return response()->json([
                'status'  => 'error',
                'message' => 'Akses ditolak.'
            ], 403);
        }

        $transaction->delete();

        return response()->json([
            'status'  => 'success',
            'message' => 'Transaksi berhasil dihapus.'
        ]);
    }
}
