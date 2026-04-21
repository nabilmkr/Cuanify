import os

import google.generativeai as genai
import joblib
import pandas as pd
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel

try:
    from dotenv import load_dotenv
    load_dotenv()
except Exception:
    pass

app = FastAPI()

# 1. Konfigurasi LLM (Gemini)
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "").strip()
llm_model = None

if GEMINI_API_KEY:
    genai.configure(api_key=GEMINI_API_KEY)
    llm_model = genai.GenerativeModel("gemini-2.5-flash")

# 2. Muat Model Machine Learning Lokal
try:
    ml_model = joblib.load("financial_model.joblib")
    print("✅ Model ML 'financial_model.joblib' berhasil dimuat!")
except Exception as e:
    print(f"❌ Gagal memuat model: {e}")
    ml_model = None

class FinancialData(BaseModel):
    user_id: int
    total_income: float
    total_expense: float
    savings: float


@app.get("/api/health")
async def health():
    return {
        "status": "ok",
        "ml_model_loaded": ml_model is not None,
        "llm_configured": llm_model is not None,
    }


@app.post("/api/predict")
async def predict_financial_status(data: FinancialData):
    if ml_model is None:
        raise HTTPException(status_code=500, detail="Model Machine Learning tidak tersedia.")

    if llm_model is None:
        raise HTTPException(status_code=503, detail="Model LLM belum dikonfigurasi. Set GEMINI_API_KEY.")

    input_data = pd.DataFrame([{
        "total_income": data.total_income,
        "total_expense": data.total_expense,
        "savings": data.savings
    }])

    try:
        # 3. Dapatkan Prediksi dari Model ML (Scikit-Learn)
        prediction = ml_model.predict(input_data)
        predicted_status = prediction[0]

        # 4. Prompt Engineering: Kirim hasil ML ke LLM untuk dibuatkan narasi
        prompt = f"""
        Kamu adalah penasihat keuangan di sebuah aplikasi mobile.
        Data keuangan user bulan ini:
        - Pemasukan: Rp {data.total_income:,.0f}
        - Pengeluaran: Rp {data.total_expense:,.0f}
        - Sisa Tabungan: Rp {data.savings:,.0f}
        - Status Sistem: {predicted_status}

        Tugas: Buat 1 paragraf singkat (maksimal 3 kalimat) berisi evaluasi dan saran finansial yang ramah, empatik, dan tidak menggurui. Gunakan bahasa Indonesia yang santai tapi profesional.
        """

        # 5. Generate Narasi menggunakan Gemini
        response = llm_model.generate_content(prompt)
        ai_insight = (getattr(response, "text", None) or "").strip()
        if not ai_insight:
            raise HTTPException(status_code=502, detail="LLM tidak mengembalikan teks insight.")

        # 6. Kembalikan Hasil Komplit ke Laravel
        return {
            "status": "success",
            "user_id": data.user_id,
            "ml_prediction": str(predicted_status),
            "ai_insight": ai_insight, # <- Ini yang akan dibaca oleh User di Frontend!
            "data_analyzed": {
                "income": data.total_income,
                "expense": data.total_expense,
                "savings": data.savings
            }
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Terjadi kesalahan pada AI Pipeline: {str(e)}")
