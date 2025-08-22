# FairPlayAI

FairPlayAI is a full-stack web application designed to help developers and data scientists analyze and mitigate bias in their AI/ML models. It provides a user-friendly interface to upload datasets, get fairness reports, and visualize the results.


## About The Project

As AI and machine learning models become increasingly integrated into our daily lives, it is crucial to ensure that they are fair and unbiased. FairPlayAI is a tool that helps you to:

* **Identify bias:** Uncover hidden biases in your datasets and models.
* **Analyze fairness:** Get a comprehensive fairness report with various metrics.
* **Mitigate bias:** Clean your dataset and download a debiased version.
* **Visualize results:** Understand the fairness report with easy-to-understand visualizations.

This project aims to make AI fairness accessible to everyone, regardless of their technical expertise.

## Key Features

* **Dataset Upload & Cleaning:**
    * Upload your dataset in CSV format.
    * Handle missing values, duplicates, and outliers.
    * Normalize your data for better model performance.
* **Bias & Fairness Metrics:**
    * Calculate a wide range of fairness metrics, including:
        * Accuracy
        * Precision
        * Recall
        * F1-score
        * Demographic Parity
        * Equalized Odds
        * Calibration
* **Visualization:**
    * Get a detailed fairness report in a visually appealing format.
    * Interactive charts and graphs to help you understand the results.
* **Downloadable Resources:**
    * Download the cleaned and debiased dataset.
    * Download the fairness report as a PDF.
* **Custom Model Support:**
    * Upload your own trained model for fairness analysis.
    * Get insights into how your model performs on different subgroups of the population.

## Technologies Used

* **Backend:** Django, Django REST Framework
* **Frontend:** React, Tailwind CSS
* **Database:** SQLite3 (or any other Django-supported database)

## Getting Started

To get a local copy up and running follow these simple steps.

### Prerequisites

* Python 3.8+
* Node.js and npm
* Pip (Python package installer)

### Installation

1.  **Clone the repo**
    ```sh
    git clone [https://github.com/Satvik-Parihar/FairPlayAI.git](https://github.com/Satvik-Parihar/FairPlayAI.git)
    ```
2.  **Backend Setup**
    ```sh
    cd FairPlayAI/backend
    pip install -r requirements.txt
    python manage.py migrate
    python manage.py runserver
    ```
3.  **Frontend Setup**
    ```sh
    cd FairPlayAI/frontend
    npm install
    npm start
    ```

## Project Structure

The repository is organized into two main parts: `backend` for the Django application and `frontend` for the React application.


```bash
FairPlayAI/
├── .gitignore                 # Specifies intentionally untracked files to ignore

├── backend/                   # Backend (Django)
│   ├── api/                   # Django app to handle core API logic
│   │   ├── migrations/        # Database migration files
│   │   ├── __init__.py
│   │   ├── admin.py           # Django admin configurations
│   │   ├── apps.py            # Application configuration
│   │   ├── models.py          # Database models
│   │   ├── serializers.py     # Manages data serialization (e.g., to JSON)
│   │   ├── tests.py           # Unit tests for the API
│   │   ├── urls.py            # URL routing for the API endpoints
│   │   ├── utils.py           # Core logic for data cleaning & fairness analysis
│   │   └── views.py           # Defines the API endpoints (request/response logic)
│   │
│   ├── fairplayai/            # Main Django project configuration directory
│   │   ├── __init__.py
│   │   ├── asgi.py            # ASGI config for async servers
│   │   ├── settings.py        # Django project settings
│   │   ├── urls.py            # Root URL configuration
│   │   └── wsgi.py            # WSGI config for synchronous servers
│   │
│   ├── db.sqlite3             # Default SQLite database (development)
│   ├── manage.py              # Django's command-line utility
│   └── requirements.txt       # Python dependencies for the backend

├── frontend/                  # Frontend (React + Tailwind)
│   ├── public/                # Base HTML and static assets
│   │   ├── index.html         # Main HTML page for the React app
│   │   └── ...
│   │
│   ├── src/                   # Source code for React app
│   │   ├── components/        # Reusable UI components (buttons, charts, forms)
│   │   ├── pages/             # Page-level components (views/screens)
│   │   ├── App.css            # Main stylesheet
│   │   ├── App.js             # Root component of the React application
│   │   ├── index.css          # Global styles
│   │   └── index.js           # Entry point of the React application
│   │
│   ├── .gitignore
│   ├── package-lock.json      # Records exact versions of dependencies
│   ├── package.json           # Lists frontend dependencies and scripts
│   └── tailwind.config.js     # Tailwind CSS configuration

└── README.md                  # Project documentation (this file)


## Usage

1.  Navigate to the web application in your browser.
2.  Upload your dataset in CSV format.
3.  The application will automatically preprocess the data and train a baseline model.
4.  You will be presented with a comprehensive fairness report with visualizations.
5.  You can download the cleaned dataset and the fairness report.
