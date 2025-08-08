import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.impute import SimpleImputer
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import StandardScaler
from sklearn.linear_model import LogisticRegression
import joblib

# Load CSV
df = pd.read_csv("Titanic-Dataset.csv")

# Select features and target
features = ['Pclass', 'Age', 'SibSp', 'Fare']
target = 'Survived'

X = df[features]
y = df[target]

# Create pipeline
pipeline = Pipeline([
    ('imputer', SimpleImputer(strategy='mean')),
    ('scaler', StandardScaler()),
    ('model', LogisticRegression())
])

# Train model
pipeline.fit(X, y)

# Attach target metadata for downstream validation
pipeline.target_col = target
joblib.dump(pipeline, 'model.pkl')
print("✅ Model saved successfully as model.pkl with target_col metadata.")
