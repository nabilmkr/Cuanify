<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Category;
use Illuminate\Http\Request;

class CategoryController extends Controller
{
    public function index(Request $request)
    {
        $request->validate([
            'type' => 'nullable|in:income,expense',
        ]);

        $query = Category::query()->orderBy('name');

        if ($request->filled('type')) {
            $query->where('type', $request->query('type'));
        }

        return response()->json([
            'status' => 'success',
            'data' => $query->get(['id', 'name', 'type', 'icon']),
        ]);
    }
}
