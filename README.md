# FairPlayAI

FairPlayAI is a full-stack application designed to analyze and mitigate **bias in AI/ML models**. It provides an end-to-end pipeline for dataset preprocessing, fairness analysis, bias detection, and visualization. The project combines a **Django backend** with a **React + Tailwind frontend** for a seamless user experience.

---

## 📂 Project Structure

```
FairPlayAI-master/
│-- backend/         # Django backend (APIs, fairness logic, dataset handling)
│-- frontend/        # React frontend (UI for uploads, fairness reports)
│-- server/          # Additional server utilities
│-- gp.py            # Utility script
│-- train_housing_model.py  # Example ML model training script
│-- requirements.txt # Python dependencies
│-- README.md        # (Existing short readme)
│-- .gitignore
│-- Titanic-Dataset.csv_fairness_report.pdf  # Example fairness report
```

---

## ✨ Features

* **Dataset Upload & Cleaning** (missing values, duplicates, outliers, normalization)
* **Bias & Fairness Metrics**

  * Accuracy, Precision, Recall, F1-score
  * Demographic Parity, Equalized Odds, Calibration
* **Visualization** of fairness reports
* **Downloadable cleaned datasets**
* **Custom model upload support**
* **Interactive React frontend** with toast notifications and real-time updates

---

## 🛠️ Tech Stack

**Backend (Django + DRF):**

* Django
* Django REST Framework
* Pandas, NumPy (data preprocessing)
* Scikit-learn (ML training & evaluation)

**Frontend (React + Tailwind):**

* React (Vite setup)
* Tailwind CSS
* ShadCN UI components
* Axios for API requests

---

## ⚙️ Setup Instructions

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/FairPlayAI.git
cd FairPlayAI-master
```

### 2. Backend Setup (Django)

```bash
cd backend
python -m venv venv
source venv/bin/activate   # On Windows: venv\Scripts\activate
pip install -r requirements.txt

# Run migrations
python manage.py migrate

# Start Django server
python manage.py runserver
```

The backend will be available at: `http://127.0.0.1:8000/`

### 3. Frontend Setup (React)

```bash
cd frontend
npm install
npm run dev
```

The frontend will be available at: `http://localhost:5173/`

---

## 🚀 Usage

1. Upload a **dataset (CSV)** via the frontend.
2. Choose **missing value strategy** (drop, mean, median, mode).
3. Run preprocessing (duplicates, outliers, normalization handled automatically).
4. Auto-detected **target column** suggested.
5. View **fairness summary** with bias metrics.
6. Download the **cleaned dataset** or generated **fairness report (PDF)**.

---

## 📊 Example Fairness Metrics

* **Accuracy**: Proportion of correct predictions.
* **Precision**: Correct positive predictions / Total predicted positives.
* **Recall**: Correct positive predictions / Actual positives.
* **F1 Score**: Harmonic mean of precision & recall.
* **ROC AUC**: Area under ROC curve (discrimination ability).
* **Demographic Parity**: Equal positive rate across groups.
* **Equalized Odds**: Equal TPR & FPR across groups.
* **Calibration**: Predicted probabilities match actual outcomes.

---

## 📑 Example Report

A sample fairness report generated on the **Titanic dataset** is included:

```
Titanic-Dataset.csv_fairness_report.pdf
```

---

