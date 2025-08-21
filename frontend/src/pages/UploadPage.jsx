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
  // ...existing code...

  // Handler for changing the target column
  const handleTargetColumnChange = (e) => {
    setTargetColumn(e.target.value);
    setIsPreprocessed(false); // Reset preprocessing if target changes
  };
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
  const [reportId, setReportId] = useState(null); // Store report id for navigation
  const [canStartAnalysis, setCanStartAnalysis] = useState(false); // Enable Start Analysis button after model metrics
  const [modelUploaded, setModelUploaded] = useState(false);

  const { toast } = useToast();
  const navigate = useNavigate();
  // Validate model and dataset columns before analysis
  const validateModelDataset = async (csvFile, modelFile) => {
    if (!csvFile || !modelFile) {
      toast({
        title: "Validation Error",
        description:
          "Both dataset and model files are required for validation.",
        variant: "destructive",
      });
      return false;
    }
    const formData = new FormData();
    formData.append("dataset", csvFile);
    formData.append("model", modelFile);
    formData.append("target_col", targetColumn); // <-- Ensure target_col is sent
    if (selectedAttributes && selectedAttributes.length > 0) {
      formData.append("sensitive_attrs", JSON.stringify(selectedAttributes));
    }
    try {
      const res = await axios.post(
        "http://localhost:8000/api/datasets/validate-model-dataset/",
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );
      if (res.data.status === "success") {
        toast({
          title: "Validation Success",
          description: `Dataset columns match model features: ${res.data.model_features.join(
            ", "
          )}`,
          variant: "success",
        });
        return true;
      } else {
        toast({
          title: "Validation Error",
          description: res.data.error || "Validation failed.",
          variant: "destructive",
        });
        return false;
      }
    } catch (err) {
      let errorMsg =
        err.response?.data?.error ||
        "Validation failed. Please check your files.";
      let details = "";
      if (err.response?.data?.missing_columns) {
        details = `\nMissing columns: ${err.response.data.missing_columns.join(
          ", "
        )}`;
      } else if (err.response?.data?.extra_columns) {
        details = `\nExtra columns: ${err.response.data.extra_columns.join(
          ", "
        )}`;
      }
      toast({
        title: "Validation Error",
        description: errorMsg + details,
        variant: "destructive",
      });
      return false;
    }
  };
  // Download handler for cleaned CSV
  function handleDownload(cleanedCSV) {
    if (!cleanedCSV) return;
    const blob = new Blob([cleanedCSV], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "cleaned_data.csv";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  }

  // Helper for rendering cleaning summary items
  function summaryItem(label, value) {
    if (
      value === undefined ||
      value === null ||
      (Array.isArray(value) && value.length === 0)
    )
      return null;
    return (
      <li>
        <strong>{label}:</strong>{" "}
        {Array.isArray(value) ? value.join(", ") : value}
      </li>
    );
  }

  // Auth state for UI
  const [isAuthenticated, setIsAuthenticated] = useState(
    !!localStorage.getItem("authToken")
  );
  const handleUploadResponse = (response) => {
    setModelUploaded(!!response.model_uploaded);
    // ...other state updates
  };

  // Listen for login/logout changes
  useEffect(() => {
    const checkAuth = () =>
      setIsAuthenticated(!!localStorage.getItem("authToken"));
    window.addEventListener("storage", checkAuth);
    return () => window.removeEventListener("storage", checkAuth);
  }, []);

  // Always trigger cleaning when csvFile changes (single or dual upload)
  useEffect(() => {
    if (csvFile && isAuthenticated) {
      // Optionally reset downstream state here if needed
      fetchCsvColumns(
        csvFile,
        missingStrategy,
        targetColumn,
        selectedAttributes
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [csvFile, missingStrategy]);

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
      if (err.response && err.response.status === 401) {
        toast.dismiss?.();
        toast({
          title: "Authentication Required",
          description: "Please log in to start analysis.",
          variant: "destructive",
        });
        return;
      }
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

  // Only call preprocessing when user clicks Continue
  const handlePreprocess = async () => {
    if (
      !preprocessedDataKey ||
      !targetColumn ||
      selectedAttributes.length === 0
    ) {
      toast({
        title: "Missing Information",
        description:
          "Please ensure a CSV is cleaned, a target column, and sensitive attributes are selected.",
        variant: "destructive",
      });
      return;
    }
    const formData = new FormData();
    formData.append("session_id", preprocessedDataKey);
    formData.append("target_col", targetColumn);
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
        description: err.response?.data?.error || "",
        variant: "destructive",
      });
      setIsPreprocessed(false);
      setProblemType(null);
    }
  };
  const handleModelSelect = async (e) => {
    const model = e.target.value;
    setSelectedModel(model);
    setCanStartAnalysis(false);

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

    // Trigger model training API call
    try {
      const formData = new FormData();
      formData.append("session_id", preprocessedDataKey);
      formData.append("target_col", targetColumn);
      formData.append("sensitive_attrs", JSON.stringify(selectedAttributes));
      formData.append("selected_model", model); // <-- Correct field name
      formData.append("problem_type", problemType);
      const res = await axios.post(
        "http://localhost:8000/api/datasets/train-selected-model/",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      setModelMetrics(res.data.metrics || null);
      setReportId(res.data.report_id || null);
      setCanStartAnalysis(true);
      toast({
        title: "Model Training Complete",
        description:
          res.data.message || "Model trained and ready for analysis.",
      });
    } catch (err) {
      setCanStartAnalysis(false);
      setReportId(null);
      toast({
        title: "Model Training Failed",
        description:
          err.response?.data?.error ||
          "An error occurred during model training.",
        variant: "destructive",
      });
    }
  };
  const handleStartAnalysis = async () => {
    // Navigate to report page after user clicks the button
    if (reportId) {
      navigate(`/report/${reportId}`);
    } else {
      navigate("/report");
    }
  };
  // In UploadPage.jsx

  // Add state for target column
  // Removed duplicate declaration of targetColumn

  // Handler for sensitive attribute selection
  const handleAttributeChange = (attribute) => {
    setSelectedAttributes((prev) => {
      if (prev.includes(attribute)) {
        // Remove if already selected
        return prev.filter((attr) => attr !== attribute);
      } else {
        // Add if not selected
        return [...prev, attribute];
      }
    });
  };

  const handleDualUpload = async () => {
    if (!csvFile) {
      toast({
        title: "CSV Required",
        description: "Please upload a CSV file.",
        variant: "destructive",
      });
      return;
    }
    if (!targetColumn || selectedAttributes.length === 0) {
      toast({
        title: "Missing Information",
        description: "Please select a target column and sensitive attributes.",
        variant: "destructive",
      });
      return;
    }
    const formData = new FormData();
    formData.append("csv_file", csvFile);
    if (modelFile) formData.append("model_file", modelFile);
    formData.append("target_col", targetColumn);
    formData.append("sensitive_attrs", JSON.stringify(selectedAttributes));
    try {
      const res = await axios.post(
        "http://localhost:8000/api/datasets/upload_csv_and_model/",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      toast({
        title: "Analysis Complete",
        description: res.data.message,
      });
      // If no model was uploaded, enable model selection and training
      if (res.data && res.data.model_uploaded === false) {
        // Set state to enable model selection and training
        setIsPreprocessed(true); // or trigger preprocessing if needed
        setCanStartAnalysis(false); // User must select model and train first
        setModelUploaded(false);
        // Optionally, navigate to model selection UI or show a prompt
      }
      // Optionally: setModelMetrics(res.data.metrics), setReportId(res.data.report_id), etc.
    } catch (err) {
      // Print full error to console for debugging
      if (err.response) {
        console.error("Upload failed:", err.response.data);
      } else {
        console.error("Upload failed:", err);
      }
      toast({
        title: "Upload Failed",
        description:
          err.response?.data?.error ||
          "An error occurred during upload. Check your files and try again.",
        variant: "destructive",
      });
    }
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
                onError={({ type, message }) => {
                  toast({
                    title:
                      type === "size" ? "File Too Large" : "Invalid File Type",
                    description: message,
                    variant: "destructive",
                  });
                }}
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

                  {/* Continue button for preprocessing */}
                  <div className="mt-6 flex flex-col gap-4">
                    <Button
                      onClick={handlePreprocess}
                      disabled={
                        selectedAttributes.length === 0 ||
                        !targetColumn ||
                        !preprocessedDataKey ||
                        isPreprocessed
                      }
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                    >
                      Continue
                    </Button>

                    {!modelUploaded && (
                      <>
                        {/* ✨ Display inferred problem type */}
                        {problemType && (
                          <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200 text-sm text-blue-700 font-medium">
                            Problem Type Detected:{" "}
                            <Badge className="bg-blue-200 text-blue-800">
                              {problemType.replace(/_/g, " ").toUpperCase()}
                            </Badge>
                          </div>
                        )}
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
                              <option value="decision_tree">
                                Decision Tree
                              </option>
                              <option value="random_forest">
                                Random Forest
                              </option>
                            </>
                          )}
                        </select>
                      </>
                    )}
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
                <div className="mt-6 bg-white/90 backdrop-blur-md border border-green-300 shadow-md rounded-xl p-6">
                  <h4 className="text-lg font-bold text-green-800 flex items-center mb-4">
                    
                    Model Metrics
                  </h4>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {Object.entries(modelMetrics).map(([key, value]) => {
                      
                      if (
                        key === "individual_fairness" ||
                        key === "calibration" ||
                        key === "equalized_odds" ||
                        key === "demographic_parity" ||
                        key === "regression_fairness"
                      ) {
                        return null;
                      }

                      const renderMetricValue = (val) => {
                        if (key == 'polynomial_degree'){
                          return isNaN(val) ? "N/A" : val.toFixed(1);
                        }
                        if (typeof val === "number")
                          return isNaN(val) ? "N/A" : val.toFixed(4);
                        if (val === null || val === undefined) return "N/A";
                        if (typeof val === "object" && val !== null) {
                          const subEntries = Object.entries(val);
                          return subEntries
                            .map(([k, v]) => {
                              if (typeof v === "object" && v !== null) {
                                return `${k}: { ${renderMetricValue(v)} }`;
                              }
                              return `${k}: ${
                                typeof v === "number"
                                  ? isNaN(v)
                                    ? "N/A"
                                    : v.toFixed(4)
                                  : v
                              }`;
                            })
                            .join(", ");
                        }
                        return val;
                      };

                      return (
                        <div
                          key={key}
                          className="bg-green-50 border border-green-200 rounded-lg px-4 py-3 shadow-sm hover:shadow-md transition-all"
                        >
                          <p className="text-xs font-medium text-green-700 tracking-wide mb-1">
                            {key.replace(/_/g, " ").toUpperCase()}
                          </p>
                          <p className="text-sm text-green-900 font-semibold">
                            {renderMetricValue(value)}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                </div>
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
                  onFileSelect={(file) => {
                    setModelFile(file);
                    setModelUploaded(!!file);
                  }}
                  selectedFile={modelFile}
                  placeholder="Drop your model file here or click to browse"
                  disabled={!csvFile}
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Start Button */}
        <div className="text-center mt-8">
          <Button
            disabled={
              !csvFile || !targetColumn || selectedAttributes.length === 0
            }
            onClick={async () => {
              // If both files are present, validate before analysis
              if (modelFile && csvFile) {
                const valid = await validateModelDataset(csvFile, modelFile);
                if (!valid) return; // Stop if validation fails
                // Proceed with analysis only if validation passes
                const formData = new FormData();
                formData.append("csv_file", csvFile);
                formData.append("model_file", modelFile);
                formData.append("target_col", targetColumn);
                formData.append(
                  "sensitive_attrs",
                  JSON.stringify(selectedAttributes)
                );
                try {
                  const res = await axios.post(
                    "http://localhost:8000/api/datasets/upload_csv_and_model/",
                    formData,
                    {
                      headers: {
                        "Content-Type": "multipart/form-data",
                      },
                    }
                  );
                  if (res.data && res.data.message) {
                    toast({
                      title: "Success",
                      description: res.data.message,
                      variant: "success",
                    });
                  } else {
                    toast({
                      title: "Success",
                      description: "Upload completed successfully.",
                      variant: "success",
                    });
                  }
                  if (res.data && res.data.report_id) {
                    setReportId(res.data.report_id);
                    navigate(`/report/${res.data.report_id}`);
                  }
                  // Optionally: setModelMetrics(res.data.metrics), setReportId(res.data.report_id), etc.
                } catch (err) {
                  let errorMsg =
                    err.response?.data?.error ||
                    "An error occurred during upload. Check your files and try again.";
                  if (err.response) {
                    console.error("Dual upload failed:", err.response.data);
                  } else {
                    console.error("Dual upload failed:", err);
                  }
                  toast({
                    title: "Upload Failed",
                    description: errorMsg,
                    variant: "destructive",
                  });
                }
              } else {
                // CSV-only flow: keep existing logic
                if (
                  !isPreprocessed ||
                  !selectedModel ||
                  !reportId ||
                  !canStartAnalysis
                ) {
                  toast({
                    title: "Not Ready",
                    description:
                      "Please complete preprocessing and model selection before starting analysis.",
                    variant: "destructive",
                  });
                  return;
                }
                handleStartAnalysis();
              }
            }}
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
