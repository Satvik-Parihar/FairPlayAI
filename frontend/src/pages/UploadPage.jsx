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

  const { toast } = useToast();
  const navigate = useNavigate();

  const fetchCsvColumns = async (file, strategy) => {
    const formData = new FormData();
    formData.append("csv_file", file);
    formData.append("missing_strategy", strategy);

    try {
      const res = await axios.post("http://127.0.0.1:8000/api/datasets/clean_csv/", formData);
      setAvailableColumns(res.data.columns || []);
      setTargetColumn(res.data.auto_target_column || "");
      setCleaningSummary(res.data.cleaning_summary || {});
      setCleanedCSV(res.data.cleaned_csv || "");
      toast.dismiss?.();
      setTimeout(() => {
        toast({
          title: "Cleaning Successful",
          description: "Data cleaned and preprocessed successfully.",
        });
      }, 1500);
    } catch (err) {
      console.error(err);
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

  useEffect(() => {
    if (csvFile) {
      fetchCsvColumns(csvFile, missingStrategy);
    }
  }, [csvFile, missingStrategy]);

  const handleAttributeChange = (col) => {
    setSelectedAttributes((prev) =>
      prev.includes(col) ? prev.filter((c) => c !== col) : [...prev, col]
    );
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
            Upload your dataset and optionally your trained model to get comprehensive fairness analysis
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8 mb-8 h-full">
          {/* Dataset Upload */}
          <Card className="flex flex-col">
            <CardHeader>
              <CardTitle className="flex items-center space-x-3">
                <span className="text-3xl">📊</span>
                <span>Dataset</span>
                <Badge className="ml-2 bg-red-100 text-red-600 text-xs">Required</Badge>
              </CardTitle>
              <CardDescription>Upload your CSV dataset used to train your model.</CardDescription>
            </CardHeader>
            <CardContent className="flex-grow flex flex-col">
              <FileUploader
                acceptedTypes=".csv"
                maxSize={50}
                onFileSelect={(file) => setCsvFile(file)}
                selectedFile={csvFile}
                placeholder="Drop your CSV file here or click to browse"
              />

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
                      onChange={(e) => setTargetColumn(e.target.value)}
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
                  <h4 className="font-semibold text-yellow-800 mb-2">Cleaning Summary</h4>
                  <ul className="text-sm text-yellow-800 list-disc list-inside">
                    {summaryItem("Strategy", cleaningSummary.strategy)}
                    {summaryItem("Dropped Rows", cleaningSummary.dropped_rows)}
                    {summaryItem("Imputed Columns", cleaningSummary.imputed_columns)}
                    {summaryItem("Removed Duplicates", cleaningSummary.removed_duplicates)}
                    {summaryItem("Outliers Removed", cleaningSummary.outliers_removed)}
                    {summaryItem("Normalized Columns", cleaningSummary.normalized_columns)}
                    {summaryItem("Converted Types", cleaningSummary.converted_columns)}
                    {summaryItem("Standardized Categories", cleaningSummary.standardized_columns)}
                  </ul>
                </div>
              )}

              {cleanedCSV && (
                <Button onClick={handleDownload} className="mt-4 bg-blue-600 hover:bg-blue-700 text-white">
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
                <Badge className="ml-2 bg-blue-100 text-blue-600 text-xs">Optional</Badge>
              </CardTitle>
              <CardDescription>Upload your trained model (.pkl) for deeper bias analysis.</CardDescription>
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
            disabled={!csvFile}
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
