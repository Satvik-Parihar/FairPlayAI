from sklearn.linear_model import LinearRegression
from sklearn.pipeline import make_pipeline
from sklearn.preprocessing import PolynomialFeatures
from sklearn.metrics import r2_score, mean_squared_error, mean_absolute_error

def train_best_polynomial(X_train, X_test, y_train, y_test, max_degree=50):
    best_score = float('-inf')
    best_model = None
    best_degree = None
    metrics = {}
    best_y_pred = None

    for degree in range(1, max_degree):
        pipeline = make_pipeline(PolynomialFeatures(degree), LinearRegression())
        pipeline.fit(X_train, y_train)
        y_pred = pipeline.predict(X_test)

        score = r2_score(y_test, y_pred)
        if score > best_score:
            best_score = score
            best_model = pipeline
            best_degree = degree
            metrics = {
                
                "r2_score": score,
                "mse": mean_squared_error(y_test, y_pred),
                "mae": mean_absolute_error(y_test, y_pred)
            }
            best_y_pred = y_pred

    return best_model, best_y_pred, metrics, best_degree
