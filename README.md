# CUANIFY (AI-Powered Finance Tracker)

CUANIFY adalah aplikasi *financial tracker* premium berbasis React Native yang tidak hanya mencatat transaksi, tetapi juga memanfaatkan Artificial Intelligence (Gemini AI & Random Forest ML) untuk menganalisis pola pengeluaran bulanan Anda.

![CUANIFY Preview](Frontend/assets/logo.png)

## Struktur Repositori (Monorepo)

Proyek ini terbagi menjadi 3 bagian utama:
1. **Frontend** — Mobile app React Native dengan Expo + Zustand.
2. **Backend** — Laravel API gateway + Sanctum Authentication.
3. **AI-environment** — FastAPI engine (Machine Learning & Gemini LLM).

> **Penting untuk Deployment**: Repositori ini memiliki 3 branch deployment (`frontend`, `backend`, dan `ai-environment`). Jika Anda meng-*host* di Vercel/Railway, pastikan Anda mengatur *Root Directory* sesuai subfolder masing-masing.

---

## 📱 1. Frontend (React Native + Expo)

Fitur utamanya meliputi desain *Glassmorphism* dark-mode, animasi *bottom sheet*/spring yang mulus, dan *skeleton loading*.

### Persyaratan
- Node.js >= 18
- Expo Go di HP Anda (iOS/Android)

### Cara Menjalankan Lokal
1. Masuk ke folder frontend: `cd Frontend`
2. Install dependensi: `npm install`
3. Sesuaikan URL API (opsional): Jika emulator Android atau backend di IP berbeda, sesuaikan `BASE_URL` di `Frontend/src/services/api.ts`.
4. Jalankan Expo: `npx expo start`
5. Scan QR code melalui aplikasi Expo Go di HP.

---

## 🛠 2. Backend (Laravel 11)

Backend melayani manajemen User, Kategori, Transaksi, serta proxy ke *AI-environment*.

### Persyaratan
- PHP >= 8.2
- Composer
- MySQL/MariaDB

### Cara Menjalankan Lokal
1. Masuk ke folder backend: `cd Backend`
2. Install dependensi: `composer install`
3. Buat file `.env`: `cp .env.example .env` (sesuaikan kredensial DB Anda)
4. Generate *application key*: `php artisan key:generate`
5. Jalankan migrasi dan seeder: `php artisan migrate --seed`
6. Jalankan server: `php artisan serve`

> **Catatan Authentication:** CUANIFY versi ini mendukung API Token Login (Sanctum). Untuk mendapatkan token: 
> 1. `php artisan tinker`
> 2. `$user = User::first();`
> 3. `$user->createToken('mobile')->plainTextToken;`
> 4. Copy token (cth: `1|abcd123...`) dan masukkan di halaman Login Android.

---

## 🧠 3. AI-environment (FastAPI + Machine Learning)

Engine ini menggunakan algoritma *Random Forest* untuk prediktif status finansial ("Sehat"/"Stabil"/"Kritis"), dan Gemini Nano/Pro untuk menghasilkan saran naratif berbahasa Indonesia.

### Persyaratan
- Python >= 3.9

### Cara Menjalankan Lokal
1. Masuk ke folder ai-environment: `cd AI-environment`
2. Buat *virtual environment* (opsional): `python -m venv venv` lalu aktifkan (`venv\Scripts\activate` di Windows).
3. Install dependensi: `pip install -r requirements.txt` (termasuk `fastapi`, `uvicorn`, `scikit-learn`, `google-genai`).
4. Pastikan model `.pkl` dan kunci Gemini API siap.
5. Jalankan server: `uvicorn main:app --host 0.0.0.0 --port 8001 --reload`

---

## 🤝 Branch Deployment Workflow

Saat Anda melakukan deploy ke *hosting*, arahkan root ke masing-masing cabang. Setiap cabang telah difilter *gitignore*-nya sehingga aman dari file env atau *cache*.
- `main` : Source code gabungan
- `frontend` : Source UI
- `backend` : Source API
- `ai-environment` : Engine AI

Dibuat dengan ❤️ untuk stabilitas finansial Anda.
