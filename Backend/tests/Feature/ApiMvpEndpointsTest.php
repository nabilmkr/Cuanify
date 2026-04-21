<?php

namespace Tests\Feature;

use App\Models\Category;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Http;
use Tests\TestCase;

class ApiMvpEndpointsTest extends TestCase
{
    use RefreshDatabase;

    public function test_private_endpoint_requires_authentication(): void
    {
        $response = $this->getJson('/api/dashboard');

        $response->assertStatus(401);
    }

    public function test_categories_endpoint_returns_data_with_optional_type_filter(): void
    {
        $user = User::factory()->create();
        $this->createDefaultCategories();

        $response = $this->actingAsApi($user)->getJson('/api/categories?type=expense');

        $response->assertOk()
            ->assertJsonPath('status', 'success');

        $types = collect($response->json('data'))->pluck('type')->unique()->values()->all();
        $this->assertSame(['expense'], $types);
    }

    public function test_dashboard_endpoint_returns_required_sections(): void
    {
        $user = User::factory()->create();
        $categories = $this->createDefaultCategories();
        $this->seedMonthlyTransactions($user, $categories, 4, 2026);

        $user->insights()->create([
            'period_month' => 4,
            'period_year' => 2026,
            'insight_text' => 'Insight terbaru.',
            'ml_prediction' => 'Aman',
            'data_analyzed' => ['income' => 1000000, 'expense' => 350000, 'savings' => 650000],
        ]);

        $response = $this->actingAsApi($user)->getJson('/api/dashboard?month=4&year=2026');

        $response->assertOk()
            ->assertJsonPath('status', 'success')
            ->assertJsonStructure([
                'status',
                'data' => [
                    'summary' => ['month', 'year', 'total_income', 'total_expense', 'total_balance'],
                    'trend_preview' => ['start_date', 'end_date', 'points'],
                    'recent_transactions',
                    'insight_preview',
                ],
            ]);
    }

    public function test_analytics_trend_supports_week_month_and_year_ranges(): void
    {
        $user = User::factory()->create();
        $categories = $this->createDefaultCategories();
        $this->seedMonthlyTransactions($user, $categories, 4, 2026);

        $week = $this->actingAsApi($user)->getJson('/api/analytics/trend?range=week&anchor_date=2026-04-10');
        $month = $this->actingAsApi($user)->getJson('/api/analytics/trend?range=month&month=4&year=2026');
        $year = $this->actingAsApi($user)->getJson('/api/analytics/trend?range=year&year=2026');

        $week->assertOk()->assertJsonPath('data.range', 'week');
        $month->assertOk()->assertJsonPath('data.range', 'month');
        $year->assertOk()->assertJsonPath('data.range', 'year');

        $this->assertNotEmpty($week->json('data.points'));
        $this->assertNotEmpty($month->json('data.points'));
        $this->assertCount(12, $year->json('data.points'));
    }

    public function test_category_distribution_returns_percentage_breakdown(): void
    {
        $user = User::factory()->create();
        $categories = $this->createDefaultCategories();
        $this->seedMonthlyTransactions($user, $categories, 4, 2026);

        $response = $this->actingAsApi($user)->getJson('/api/analytics/category-distribution?range=month&month=4&year=2026');

        $response->assertOk()
            ->assertJsonPath('status', 'success');

        $totalExpense = $response->json('data.total_expense');
        $rows = collect($response->json('data.categories'));

        $this->assertGreaterThan(0, $totalExpense);
        $this->assertTrue($rows->every(fn ($item) => array_key_exists('percentage', $item)));
    }

    public function test_profile_and_notification_settings_can_be_updated(): void
    {
        $user = User::factory()->create([
            'name' => 'Old Name',
            'notifications_enabled' => true,
        ]);

        $profileResponse = $this->actingAsApi($user)->putJson('/api/profile', [
            'name' => 'New Name',
            'avatar_url' => 'https://example.com/avatar.png',
        ]);

        $profileResponse->assertOk()
            ->assertJsonPath('data.name', 'New Name');

        $notificationResponse = $this->actingAsApi($user)->putJson('/api/settings/notifications', [
            'notifications_enabled' => false,
        ]);

        $notificationResponse->assertOk()
            ->assertJsonPath('data.notifications_enabled', false);
    }

    public function test_revoke_tokens_keeps_current_token_and_removes_others(): void
    {
        $user = User::factory()->create();
        $currentToken = $user->createToken('current');
        $user->createToken('other-a');
        $user->createToken('other-b');

        $response = $this->withHeader('Authorization', 'Bearer '.$currentToken->plainTextToken)
            ->postJson('/api/settings/security/revoke-tokens');

        $response->assertOk()
            ->assertJsonPath('status', 'success');

        $remainingTokenIds = $user->tokens()->pluck('id')->all();
        $this->assertSame([$currentToken->accessToken->id], $remainingTokenIds);
    }

    public function test_financial_insight_refresh_saves_new_version_and_history_returns_latest_first(): void
    {
        $user = User::factory()->create();
        $categories = $this->createDefaultCategories();
        $this->seedMonthlyTransactions($user, $categories, 4, 2026);

        config(['services.ai.service_url' => 'http://ai.test']);
        Http::fake([
            'http://ai.test/api/predict' => Http::response([
                'status' => 'success',
                'user_id' => $user->id,
                'ml_prediction' => 'Perlu Perhatian',
                'ai_insight' => 'Kurangi pengeluaran makan minggu ini.',
                'data_analyzed' => [
                    'income' => 1000000,
                    'expense' => 350000,
                    'savings' => 650000,
                ],
            ], 200),
        ]);

        $firstRefresh = $this->actingAsApi($user)->postJson('/api/financial-insight/refresh', [
            'month' => 4,
            'year' => 2026,
        ]);

        $firstRefresh->assertOk()->assertJsonPath('status', 'success');
        $firstId = $firstRefresh->json('data.insight_id');

        $secondRefresh = $this->actingAsApi($user)->postJson('/api/financial-insight/refresh', [
            'month' => 4,
            'year' => 2026,
        ]);

        $secondRefresh->assertOk()->assertJsonPath('status', 'success');
        $secondId = $secondRefresh->json('data.insight_id');

        $this->assertNotSame($firstId, $secondId);

        $history = $this->actingAsApi($user)->getJson('/api/financial-insight/history?month=4&year=2026');
        $history->assertOk()->assertJsonPath('status', 'success');

        $items = $history->json('data.items');
        $this->assertSame($secondId, $items[0]['id']);
    }

    private function actingAsApi(User $user): self
    {
        $token = $user->createToken('test-token')->plainTextToken;

        return $this->withHeader('Authorization', 'Bearer '.$token);
    }

    /**
     * @return array<string, Category>
     */
    private function createDefaultCategories(): array
    {
        return [
            'income' => Category::create([
                'name' => 'Gaji',
                'type' => 'income',
                'icon' => 'wallet',
            ]),
            'expense_food' => Category::create([
                'name' => 'Makanan',
                'type' => 'expense',
                'icon' => 'food',
            ]),
            'expense_transport' => Category::create([
                'name' => 'Transportasi',
                'type' => 'expense',
                'icon' => 'car',
            ]),
        ];
    }

    /**
     * @param array<string, Category> $categories
     */
    private function seedMonthlyTransactions(User $user, array $categories, int $month, int $year): void
    {
        $user->transactions()->create([
            'category_id' => $categories['income']->id,
            'amount' => 1_000_000,
            'transaction_date' => sprintf('%d-%02d-01', $year, $month),
            'note' => 'Income',
        ]);

        $user->transactions()->create([
            'category_id' => $categories['expense_food']->id,
            'amount' => 200_000,
            'transaction_date' => sprintf('%d-%02d-03', $year, $month),
            'note' => 'Food',
        ]);

        $user->transactions()->create([
            'category_id' => $categories['expense_transport']->id,
            'amount' => 150_000,
            'transaction_date' => sprintf('%d-%02d-05', $year, $month),
            'note' => 'Transport',
        ]);
    }
}
