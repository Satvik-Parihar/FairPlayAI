// UploadPage.jsx
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import FileUploader from "../components/FileUploader";
import { CheckCircle, Zap } from "lucide-react";
import axios from "axios";

const UploadPage = () => {
  const [csvFile, setCsvFile] = useState(null);
  const [modelFile, setModelFile] = useState(null);
  const [availableColumns, setAvailableColumns] = useState([]);
  const [targetColumn, setTargetColumn] = useState("");
  const [selectedAttributes, setSelectedAttributes] = useState([]);
  const [missingStrategy, setMissingStrategy] = useState("drop");
  const [cleaningSummary, setCleaningSummary] = useState(null);
  const [cleanedCSV, setCleanedCSV] = useState(null);
  const [selectedModel, setSelectedModel] = useState("");
  const [isPreprocessed, setIsPreprocessed] = useState(false);
  const [preprocessedDataKey, setPreprocessedDataKey] = useState(null); // 👈 New state for data_key
  const [modelMetrics, setModelMetrics] = useState(null); // To display metrics
  const [problemType, setProblemType] = useState(null);

  const { toast } = useToast();
  const navigate = useNavigate();

  // Auth state for UI
  const [isAuthenticated, setIsAuthenticated] = useState(
    !!localStorage.getItem("authToken")
  );

  // Listen for login/logout changes
  useEffect(() => {
    const checkAuth = () =>
      setIsAuthenticated(!!localStorage.getItem("authToken"));
    window.addEventListener("storage", checkAuth);
    return () => window.removeEventListener("storage", checkAuth);
  }, []);

  const fetchCsvColumns = async (file, strategy, targetCol, sensitiveAttrs) => {
    // Check authentication before upload
    const token = localStorage.getItem("authToken");
    if (!token) {
      toast({
        title: "Authentication Required",
        description: "Please log in to upload a CSV.",
        variant: "destructive",
      });
      return;
    }
    const formData = new FormData();
    formData.append("csv_file", file);
    formData.append("missing_strategy", strategy);
    if (targetCol) formData.append("target_col", targetCol);
    if (sensitiveAttrs && sensitiveAttrs.length > 0)
      formData.append("sensitive_attrs", JSON.stringify(sensitiveAttrs));
    try {
      const res = await axios.post(
        "http://localhost:8000/api/datasets/clean_csv/",
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            // Do NOT set Content-Type here; axios will handle it for FormData
          },
        }
      );
      setAvailableColumns(res.data.columns || []);
      setTargetColumn(res.data.auto_target_column || "");
      setCleaningSummary(res.data.cleaning_summary || {});
      setCleanedCSV(res.data.cleaned_csv || "");
      setPreprocessedDataKey(res.data.session_id || null); // Store session_id for preprocessing
      toast.dismiss?.();
      toast({
        title: "Cleaning Successful",
        description: "Data cleaned successfully.",
      });
    } catch (err) {
      console.error("Cleaning failed:", err.response?.data || err);
      toast.dismiss?.();
      setTimeout(() => {
        toast({
          title: "Cleaning Failed",
          description: "Something went wrong while cleaning the dataset.",
          variant: "destructive",
        });
      }, 1500);
    }
  };
  const triggerPreprocessing = async (target_col, initial_data_key = null) => {
    if (isPreprocessed && preprocessedDataKey && problemType) {
      console.log(
        "Preprocessing already done for current selections. Skipping re-trigger."
      );
      return;
    }
    if (!targetColumn || selectedAttributes.length === 0) {
      console.warn(
        "Skipping preprocessing: Missing required inputs (Session ID, Target Column, or Sensitive Attributes)."
      );
      toast({
        title: "Missing Information",
        description:
          "Please ensure a CSV is cleaned, a target column, and sensitive attributes are selected.",
        variant: "destructive",
      });
      return;
    }

    const formData = new FormData();
    formData.append("session_id", initial_data_key || preprocessedDataKey);
    formData.append("target_col", target_col);
    formData.append("sensitive_attrs", JSON.stringify(selectedAttributes));

    try {
      const res = await axios.post(
        "http://localhost:8000/api/datasets/preprocess/",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      setProblemType(res.data.problem_type);
      toast({
        title: "Preprocessing Complete",
        description: res.data.message || "Dataset preprocessed.",
      });
      setIsPreprocessed(true);
    } catch (err) {
      console.error("Preprocessing failed:", err.response?.data || err);
      toast({
        title: "Preprocessing Failed",
        description:
          "Check logs or input CSV." + (err.response?.data?.error || ""),
        variant: "destructive",
      });
      setIsPreprocessed(false);
      setPreprocessedDataKey(null);
      setProblemType(null);
    }
  };
  const handleModelSelect = async (e) => {
    const model = e.target.value;
    setSelectedModel(model);

    // Debug log for session_id and selected_model
    console.log(
      "[DEBUG] handleModelSelect: preprocessedDataKey=",
      preprocessedDataKey,
      "selectedModel=",
      model,
      "isPreprocessed=",
      isPreprocessed,
      "problemType=",
      problemType
    );

    if (!targetColumn) {
      toast({
        title: "Missing Target Column",
        description: "Please select a target column first.",
        variant: "destructive",
      });
      return;
    }
    if (!isPreprocessed || !preprocessedDataKey || !problemType) {
      toast({
        title: "Waiting for Preprocessing",
        description:
          "Please wait for preprocessing to complete before training.",
        variant: "destructive",
      });
      return;
    }
    if (!preprocessedDataKey) {
      toast({
        title: "Session ID Missing",
        description:
          "Session ID is missing. Please re-upload and preprocess your data.",
        variant: "destructive",
      });
      console.error(
        "[ERROR] No session_id (preprocessedDataKey) at model training."
      );
      return;
    }
    if (!model) {
      toast({
        title: "Model Not Selected",
        description: "Please select a model before training.",
        variant: "destructive",
      });
      console.error("[ERROR] No model selected at model training.");
      return;
    }

    try {
      const payload = {
        session_id: preprocessedDataKey,
        selected_model: model,
        target_col: targetColumn,
        problem_type: problemType,
      };
      console.log("[DEBUG] Sending to /train-selected-model/:", payload);
      const res = await axios.post(
        "http://localhost:8000/api/datasets/train-selected-model/",
        payload,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      const { metrics, message } = res.data;

      toast({
        title: "✅ Model Trained",
        description:
          `${message}. Accuracy: ${metrics.accuracy ?? "N/A"}` +
          (metrics.r2_score !== undefined
            ? ` R2 Score: ${metrics.r2_score.toFixed(4)}`
            : ""),
      });

      setModelMetrics(metrics);
    } catch (err) {
      console.error("Model training failed:", err.response?.data || err);
      toast({
        title: "❌ Model Training Failed",
        description: "Check backend logs or inputs.",
        variant: "destructive",
      });
    }
  };

  // Trigger cleaning when CSV or missing strategy changes
  useEffect(() => {
    if (csvFile && missingStrategy) {
      setSelectedModel("");
      setIsPreprocessed(false);
      setPreprocessedDataKey(null);
      setProblemType(null);
      setCleaningSummary(null);
      setCleanedCSV(null);
      setAvailableColumns([]);
      setTargetColumn("");
      setSelectedAttributes([]);
      fetchCsvColumns(csvFile, missingStrategy);
    }
  }, [csvFile, missingStrategy]);

  // Only trigger preprocessing after cleaning is successful and user selects attributes/target
  useEffect(() => {
    if (
      cleanedCSV &&
      preprocessedDataKey &&
      targetColumn &&
      selectedAttributes.length > 0 &&
      !isPreprocessed
    ) {
      triggerPreprocessing(targetColumn);
    }
  }, [
    cleanedCSV,
    preprocessedDataKey,
    targetColumn,
    selectedAttributes,
    isPreprocessed,
  ]);

  const handleAttributeChange = (col) => {
    setSelectedAttributes((prev) =>
      prev.includes(col) ? prev.filter((c) => c !== col) : [...prev, col]
    );
    // Don't reset cleaning/preprocessing here; let useEffect handle it
  };
  const handleTargetColumnChange = (e) => {
    setTargetColumn(e.target.value);
    // Don't reset cleaning/preprocessing here; let useEffect handle it
  };
  const handleDownload = () => {
    const blob = new Blob([cleanedCSV], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "cleaned_data.csv";
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const summaryItem = (label, value) => {
    if (!value || (Array.isArray(value) && value.length === 0)) return null;
    return (
      <li key={label}>
        {label}: {Array.isArray(value) ? value.join(", ") : value}
      </li>
    );
  };
  const handleStartAnalysis = async () => {
    await axios.post("/api/datasets/analyze/", {
      cleaned_csv,
      sensitive_columns: selectedAttributes,
      target_column: targetColumn,
      model_choice: selectedModel,
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 py-12">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <Badge className="mb-4 bg-blue-50 text-blue-600 border-blue-200">
            <Zap className="w-3 h-3 mr-1" /> AI Analysis
          </Badge>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Upload Your Data for Bias Analysis
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Upload your dataset and optionally your trained model to get
            comprehensive fairness analysis
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8 mb-8 h-full">
          {/* Dataset Upload */}
          <Card className="flex flex-col">
            <CardHeader>
              <CardTitle className="flex items-center space-x-3">
                <span className="text-3xl">📊</span>
                <span>Dataset</span>
                <Badge className="ml-2 bg-red-100 text-red-600 text-xs">
                  Required
                </Badge>
              </CardTitle>
              <CardDescription>
                Upload your CSV dataset used to train your model.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex-grow flex flex-col">
              <FileUploader
                acceptedTypes=".csv"
                maxSize={50}
                onFileSelect={
                  isAuthenticated ? (file) => setCsvFile(file) : undefined
                }
                selectedFile={csvFile}
                placeholder={
                  isAuthenticated
                    ? "Drop your CSV file here or click to browse"
                    : "Login to upload CSV"
                }
                disabled={!isAuthenticated}
              />
              {!isAuthenticated && (
                <div className="mt-2 text-red-600 text-sm font-semibold">
                  Please{" "}
                  <a href="/login" className="underline text-blue-600">
                    log in
                  </a>{" "}
                  to upload a CSV file.
                </div>
              )}

              <Label className="block mt-4 mb-2 text-sm font-medium text-gray-700">
                Missing Value Strategy
              </Label>
              <select
                value={missingStrategy}
                onChange={(e) => setMissingStrategy(e.target.value)}
                className="mb-4 w-full p-2 border rounded"
              >
                <option value="drop">Drop Rows</option>
                <option value="mean">Replace with Mean</option>
                <option value="median">Replace with Median</option>
                <option value="mode">Replace with Mode</option>
              </select>

              {availableColumns.length > 0 && (
                <>
                  <h3 className="text-md font-semibold text-gray-700 mt-4 mb-1">
                    Select Sensitive Attributes
                  </h3>
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {availableColumns.map((col) => (
                      <div
                        key={col}
                        className={`p-3 border-2 rounded-lg cursor-pointer ${
                          selectedAttributes.includes(col)
                            ? "border-blue-500 bg-blue-50"
                            : "border-gray-200 hover:border-gray-300"
                        }`}
                        onClick={() => handleAttributeChange(col)}
                      >
                        <input
                          type="checkbox"
                          checked={selectedAttributes.includes(col)}
                          onChange={() => handleAttributeChange(col)}
                          className="mr-2"
                        />
                        <Label>{col}</Label>
                      </div>
                    ))}
                  </div>

                  <div className="mt-6">
                    <Label className="block text-sm font-medium text-gray-700 mb-2">
                      Select Target Column
                    </Label>
                    <select
                      value={targetColumn}
                      onChange={handleTargetColumnChange}
                      className="w-full p-2 border rounded"
                    >
                      <option value="">-- Select --</option>
                      {availableColumns.map((col) => (
                        <option key={col} value={col}>
                          {col}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* ✨ Display inferred problem type */}
                  {problemType && (
                    <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200 text-sm text-blue-700 font-medium">
                      Problem Type Detected:{" "}
                      <Badge className="bg-blue-200 text-blue-800">
                        {problemType.replace(/_/g, " ").toUpperCase()}
                      </Badge>
                    </div>
                  )}

                  <div className="mt-6">
                    <Label className="block text-sm font-medium text-gray-700 mb-2">
                      Select Model for Training
                    </Label>
                    {/* Dynamic model options based on problemType */}
                    <select
                      value={selectedModel}
                      onChange={handleModelSelect}
                      className="w-full p-2 border rounded"
                      disabled={!isPreprocessed || !problemType}
                    >
                      <option value="">-- Select Model --</option>
                      {problemType === "regression" && (
                        <>
                          <option value="linear_regression">
                            Linear Regression
                          </option>
                          <option value="polynomial_regression">
                            Polynomial Regression
                          </option>
                        </>
                      )}
                      {(problemType === "binary_classification" ||
                        problemType === "multi_class_classification") && (
                        <>
                          <option value="logistic_regression">
                            Logistic Regression
                          </option>
                          <option value="knn">K-Nearest Neighbors</option>
                          <option value="decision_tree">Decision Tree</option>
                          <option value="random_forest">Random Forest</option>
                        </>
                      )}
                    </select>
                  </div>
                </>
              )}

              {csvFile && (
                <div className="mt-4 p-3 bg-green-50 rounded-lg border border-green-200">
                  <div className="flex items-center space-x-2">
                    <Badge variant="secondary" className="mt-2 text-sm">
                      {csvFile.name} ({(csvFile.size / 1024).toFixed(2)} KB)
                    </Badge>
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <span className="text-sm text-green-700 font-medium">
                      Dataset ready for analysis
                    </span>
                  </div>
                </div>
              )}

              {cleaningSummary && (
                <div className="mt-6 bg-yellow-50 border border-yellow-300 p-4 rounded">
                  <h4 className="font-semibold text-yellow-800 mb-2">
                    Cleaning Summary
                  </h4>
                  <ul className="text-sm text-yellow-800 list-disc list-inside">
                    {summaryItem("Strategy", cleaningSummary.strategy)}
                    {summaryItem(
                      "Initial Shape",
                      `(${cleaningSummary.initial_shape[0]} rows, ${cleaningSummary.initial_shape[1]} cols)`
                    )}
                    {summaryItem("Dropped Rows", cleaningSummary.dropped_rows)}
                    {summaryItem(
                      "Imputed Columns",
                      cleaningSummary.imputed_columns
                    )}
                    {summaryItem(
                      "Duplicates Removed",
                      cleaningSummary.duplicates_removed
                    )}
                    {summaryItem(
                      "Outliers Removed",
                      cleaningSummary.outliers_removed
                    )}
                    {summaryItem(
                      "Type Converted Columns",
                      cleaningSummary.type_converted_columns
                    )}
                    {summaryItem(
                      "Converted Types",
                      cleaningSummary.converted_columns
                    )}
                    {summaryItem(
                      "Normalized Categories",
                      cleaningSummary.normalized_columns
                    )}
                  </ul>
                </div>
              )}
              {modelMetrics && (
                <div className="mt-6 bg-green-50 border border-green-300 p-4 rounded">
                  <h4 className="font-semibold text-green-800 mb-2">
                    Model Metrics
                  </h4>
                  <ul className="text-sm text-green-800 list-disc list-inside">
                    {Object.entries(modelMetrics).map(([key, value]) => (
                      <li key={key}>
                        {key.replace(/_/g, " ").toUpperCase()}:{" "}
                        {typeof value === "number" ? value.toFixed(4) : value}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {cleanedCSV && (
                <Button
                  onClick={handleDownload}
                  className="mt-4 bg-blue-600 hover:bg-blue-700 text-white"
                >
                  Download Cleaned CSV
                </Button>
              )}
            </CardContent>
          </Card>

          {/* Model Upload */}
          <Card className="flex flex-col h-full">
            <CardHeader>
              <CardTitle className="flex items-center space-x-3">
                <span className="text-3xl">🤖</span>
                <span>ML Model</span>
                <Badge className="ml-2 bg-blue-100 text-blue-600 text-xs">
                  Optional
                </Badge>
              </CardTitle>
              <CardDescription>
                Upload your trained model (.pkl) for deeper bias analysis.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex-grow flex flex-col">
              <div className="flex-grow">
                <FileUploader
                  acceptedTypes=".pkl"
                  maxSize={100}
                  onFileSelect={setModelFile}
                  selectedFile={modelFile}
                  placeholder="Drop your model file here or click to browse"
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Start Button */}
        <div className="text-center mt-8">
          <Button
            disabled={
              !csvFile ||
              !targetColumn ||
              selectedAttributes.length === 0 ||
              !isPreprocessed ||
              !selectedModel
            }
            className="px-12 py-4 bg-gradient-to-br from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
          >
            <Zap className="mr-3 h-5 w-5" />
            Start AI Bias Analysis
          </Button>
        </div>
      </div>
    </div>
  );
};

export default UploadPage;
