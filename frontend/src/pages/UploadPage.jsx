import { useState } from "react";
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
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import FileUploader from "../components/FileUploader";
import { useApi } from "../hooks/useApi";
import { CheckCircle, AlertTriangle, Zap, Shield } from "lucide-react";
import axios from "axios";

const UploadPage = () => {
  const [csvFile, setCsvFile] = useState(null);
  const [modelFile, setModelFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  // const [selectedAttributes, setSelectedAttributes] = useState([
  //   "gender",
  //   "age",
  //   "race",
  // ]);
  const [selectedAttributes, setSelectedAttributes] = useState([]);

  const navigate = useNavigate();
  const { toast } = useToast();
  const { uploadAndAnalyze } = useApi();
  const [availableColumns, setAvailableColumns] = useState([]);
  const [targetColumn, setTargetColumn] = useState("");

  const fetchCsvColumns = async (file) => {
    const formData = new FormData();
    formData.append("csv_file", file);

    try {
      const response = await axios.post(
        "http://127.0.0.1:8000/api/fairness/get_csv_columns/",
        formData
      );

      const cols = response.data.columns;
      setAvailableColumns(cols);
      setSelectedAttributes([]); // reset on new upload
      setTargetColumn(""); // reset
    } catch (err) {
      toast({
        title: "CSV Error",
        description: err.response?.data?.error,
        variant: "destructive",
      });
    }
  };

  // const sensitiveAttributes = [
  //   { id: "gender", label: "Gender", description: "Male, Female, Non-binary" },
  //   { id: "age", label: "Age", description: "Age groups and ranges" },
  //   { id: "race", label: "Race/Ethnicity", description: "Racial and ethnic groups" },
  //   { id: "income", label: "Income Level", description: "Economic status indicators" },
  //   { id: "education", label: "Education", description: "Educational background" },
  //   { id: "location", label: "Geographic Location", description: "Regional and location data" },
  // ];

  const handleAttributeChange = (attributeId) => {
    setSelectedAttributes((prev) =>
      prev.includes(attributeId)
        ? prev.filter((id) => id !== attributeId)
        : [...prev, attributeId]
    );
  };

  const handleUpload = async () => {
    if (!csvFile) {
      toast({
        title: "Missing File",
        description: "Please upload a CSV file to continue.",
        variant: "destructive",
      });
      return;
    }

    if (selectedAttributes.length === 0) {
      toast({
        title: "No Attributes Selected",
        description:
          "Please select at least one sensitive attribute to analyze.",
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);

    try {
      const formData = new FormData();
      formData.append("csv_file", csvFile);
      if (modelFile) {
        formData.append("model_file", modelFile);
      }
      // formData.append(
      //   "sensitive_attributes",
      //   JSON.stringify(selectedAttributes)
      // );
      formData.append(
        "sensitive_attributes",
        JSON.stringify(selectedAttributes)
      );
      formData.append("target_column", targetColumn);
      const response = await uploadAndAnalyze(formData);

      setUploadProgress(100);

      toast({
        title: "Upload Successful",
        description: "Your files have been uploaded and analysis has started.",
      });

      // Navigate to report page with the analysis ID
      navigate(`/report/${response.analysis_id}`);
    } catch (error) {
      console.error("Upload Error 🔥", error.response?.data || error.message); // 👈 this
      toast({
        title: "Upload Failed",
        description:
          error.response?.data?.error ||
          "There was an error uploading your files. Please try again.",
        variant: "destructive",
      });
      setUploadProgress(0);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 py-12">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <Badge className="mb-4 bg-blue-50 text-blue-600 border-blue-200">
            <Zap className="w-3 h-3 mr-1" />
            AI Analysis
          </Badge>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Upload Your Data for Bias Analysis
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Upload your dataset and optionally your trained model to get
            comprehensive fairness analysis across multiple sensitive attributes
          </p>
        </div>

        {/* Upload Progress */}
        {isUploading && (
          <Card className="mb-8 border-blue-200 bg-blue-50">
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-blue-900">
                      Uploading and analyzing...
                    </span>
                    <span className="text-sm text-blue-700">
                      {uploadProgress}%
                    </span>
                  </div>
                  <Progress value={uploadProgress} className="h-2" />
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="grid lg:grid-cols-2 gap-8 mb-8">
          {/* CSV Upload */}
          <Card className="group hover:shadow-xl transition-all duration-300 border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
                  <span className="text-2xl">📊</span>
                </div>
                <div>
                  <span>Dataset</span>
                  <Badge className="ml-2 bg-red-100 text-red-600 text-xs">
                    Required
                  </Badge>
                </div>
              </CardTitle>
              <CardDescription className="text-gray-600">
                Upload your CSV dataset containing the data used to train your
                model. Make sure it includes the sensitive attributes you want
                to analyze.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {/* <FileUploader
                acceptedTypes=".csv"
                maxSize={50}x
                onFileSelect={setCsvFile}
                selectedFile={csvFile}
                placeholder="Drop your CSV file here or click to browse"
              /> */}
              <FileUploader
                acceptedTypes=".csv"
                maxSize={50}
                onFileSelect={(file) => {
                  setCsvFile(file);
                  fetchCsvColumns(file);
                }}
                selectedFile={csvFile}
                placeholder="Drop your CSV file here or click to browse"
              />
              {availableColumns.length > 0 && (
                <>
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
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <span className="text-sm text-green-700 font-medium">
                      Dataset ready for analysis
                    </span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Model Upload */}
          <Card className="group hover:shadow-xl transition-all duration-300 border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-purple-50 rounded-lg flex items-center justify-center">
                  <span className="text-2xl">🤖</span>
                </div>
                <div>
                  <span>ML Model</span>
                  <Badge className="ml-2 bg-blue-100 text-blue-600 text-xs">
                    Optional
                  </Badge>
                </div>
              </CardTitle>
              <CardDescription className="text-gray-600">
                Upload your trained model file (.pkl) for enhanced analysis
                including prediction-based fairness metrics and model-specific
                insights.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <FileUploader
                acceptedTypes=".pkl"
                maxSize={100}
                onFileSelect={setModelFile}
                selectedFile={modelFile}
                placeholder="Drop your model file here or click to browse"
              />
              {modelFile && (
                <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-blue-600" />
                    <span className="text-sm text-blue-700 font-medium">
                      Model ready for enhanced analysis
                    </span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Analysis Configuration */}
        {/* <Card className="mb-8 border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-orange-50 rounded-lg flex items-center justify-center">
                <Shield className="w-5 h-5 text-orange-600" />
              </div>
              <span>Sensitive Attributes Configuration</span>
            </CardTitle>
            <CardDescription className="text-gray-600">
              Select the sensitive attributes you want to analyze for bias. We
              recommend selecting all relevant attributes for comprehensive
              analysis.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {sensitiveAttributes.map((attribute) => (
                <div
                  key={attribute.id}
                  className={`p-4 rounded-lg border-2 cursor-pointer transition-all duration-300 ${
                    selectedAttributes.includes(attribute.id)
                      ? "border-blue-500 bg-blue-50"
                      : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                  }`}
                  onClick={() => handleAttributeChange(attribute.id)}
                >
                  <div className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      id={attribute.id}
                      checked={selectedAttributes.includes(attribute.id)}
                      onChange={() => handleAttributeChange(attribute.id)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <div className="flex-1">
                      <Label
                        htmlFor={attribute.id}
                        className="font-medium text-gray-900 cursor-pointer"
                      >
                        {attribute.label}
                      </Label>
                      <p className="text-xs text-gray-500 mt-1">
                        {attribute.description}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {selectedAttributes.length > 0 && (
              <div className="mt-6 p-4 bg-green-50 rounded-lg border border-green-200">
                <div className="flex items-start space-x-2">
                  <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-green-800">
                      {selectedAttributes.length} attribute
                      {selectedAttributes.length > 1 ? "s" : ""} selected for
                      analysis
                    </p>
                    <p className="text-xs text-green-600 mt-1">
                      Selected:{" "}
                      {selectedAttributes
                        .map(
                          (id) =>
                            sensitiveAttributes.find((attr) => attr.id === id)
                              ?.label
                        )
                        .join(", ")}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card> */}

        {/* Upload Button */}
        <div className="text-center">
          <Button
            onClick={handleUpload}
            disabled={
              !csvFile || isUploading || selectedAttributes.length === 0
            }
            size="lg"
            className="px-12 py-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
          >
            {isUploading ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                Analyzing Your Data...
              </>
            ) : (
              <>
                <Zap className="mr-3 h-5 w-5" />
                Start AI Bias Analysis
              </>
            )}
          </Button>

          <div className="mt-6 flex items-center justify-center space-x-6 text-sm text-gray-500">
            <div className="flex items-center space-x-2">
              <Shield className="w-4 h-4" />
              <span>Secure & Private</span>
            </div>
            <div className="flex items-center space-x-2">
              <Zap className="w-4 h-4" />
              <span>2-5 min analysis</span>
            </div>
            <div className="flex items-center space-x-2">
              <CheckCircle className="w-4 h-4" />
              <span>Instant results</span>
            </div>
          </div>
        </div>
        
      </div>
    </div>
  );
};

export default UploadPage;
