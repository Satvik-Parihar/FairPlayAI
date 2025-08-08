import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestRegressor
from sklearn.metrics import mean_squared_error, r2_score
import joblib

# Load the housing dataset (expects 'housing.csv' in the same directory)
df = pd.read_csv('housing.csv')

# Set your target column (e.g., 'median_house_value')
target_col = 'price'


# Features: drop target and any non-feature columns (adjust as needed)
feature_cols = [col for col in df.columns if col != target_col]
X_raw = df[feature_cols]
y = df[target_col]

# One-hot encode all categorical columns
X = pd.get_dummies(X_raw, drop_first=True)

# Split data
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

# Train model
model = RandomForestRegressor(n_estimators=100, random_state=42)
model.fit(X_train, y_train)

# Evaluate
y_pred = model.predict(X_test)
mse = mean_squared_error(y_test, y_pred)
r2 = r2_score(y_test, y_pred)
print(f"MSE: {mse:.4f}")
print(f"R^2: {r2:.4f}")

# Save model with feature_names_in_ and target_col metadata (use original columns for compatibility)
model.feature_names_in_ = X_raw.columns.values
model.target_col = target_col
joblib.dump(model, 'housing_model.pkl')
print("✅ Model saved successfully as housing_model.pkl with target_col metadata.")
