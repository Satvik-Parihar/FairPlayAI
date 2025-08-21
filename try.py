import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestRegressor

# Load dataset
df = pd.read_csv("Housing.csv")

# Define target column (replace with actual name in your CSV)
target = "price"   # <-- change this to the correct column in your file

# Select only the features you want
X = df[["bathrooms", "bedrooms"]]
y = df[target]

# Train-test split
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

# Model
model = RandomForestRegressor(random_state=42)
model.fit(X_train, y_train)

# Evaluate
print("R² Score:", model.score(X_test, y_test))
