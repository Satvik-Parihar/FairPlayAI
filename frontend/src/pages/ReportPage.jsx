import { useParams } from "react-router-dom";
import { useEffect, useState, useCallback, useRef } from "react";
import { useApi } from "../hooks/useApi";
import { useToast } from "../hooks/use-toast";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import MetricCard from "../components/MetricCard";
import GraphDisplay from "../components/GraphDisplay";
import SuggestionBox from "../components/SuggestionBox";
import {
  Download,
  Share,
  AlertTriangle,
  CheckCircle,
  XCircle,
} from "lucide-react";
import html2pdf from "html2pdf.js";

// import { useRef } from "react";

// Helper functions could be moved to a separate file
const getScoreColor = (score) => {
  if (score >= 0.8) return "text-green-600";
  if (score >= 0.6) return "text-yellow-600";
  return "text-red-600";
};

const getScoreIcon = (score) => {
  if (score >= 0.8) return <CheckCircle className="h-5 w-5 text-green-600" />;
  if (score >= 0.6)
    return <AlertTriangle className="h-5 w-5 text-yellow-600" />;
  return <XCircle className="h-5 w-5 text-red-600" />;
};

const getSeverityBadgeVariant = (severity) => {
  switch (severity) {
    case "high":
      return "destructive";
    case "medium":
      return "secondary";
    case "low":
      return "outline";
    default:
      return "outline";
  }
};

const ReportPage = () => {
  const { reportId } = useParams();
  const [reportData, setReportData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const { getReport } = useApi();
  const { toast } = useToast();
  const reportRef = useRef();
  // Track which calibration attributes are expanded
  const [calibrationExpanded, setCalibrationExpanded] = useState({});

  const fetchReport = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await getReport(reportId);
      setReportData(data);
    } catch (err) {
      setError(err);
      toast({
        title: "Error Loading Report",
        description: err.response?.data?.error || "Failed to load report data",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [reportId, getReport, toast]);

  // useEffect(() => {
  //   fetchReport();
  // }, [fetchReport]);
  useEffect(() => {
    const fetchReport = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const data = await getReport(reportId);
        setReportData(data);
      } catch (err) {
        setError(err);
        toast({
          title: "Error Loading Report",
          description:
            err.response?.data?.error || "Failed to load report data",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchReport();
  }, [reportId]);

  // Log the full reportData for debugging
  if (reportData) {
    // eslint-disable-next-line no-console
    console.log("ReportPage: reportData from backend:", reportData);
  }
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        Loading...
      </div>
    );
  }

  if (error || !reportData) {
    return (
      <div className="flex flex-col justify-center items-center h-screen gap-4">
        <p>Report not found or failed to load</p>
        <Button onClick={fetchReport}>Retry</Button>
      </div>
    );
  }

  // Defensive fallback for missing fields
  const metrics = reportData.metrics ?? {};
  const biasDetected = Array.isArray(reportData.bias_detected)
    ? reportData.bias_detected
    : [];
  const suggestions = Array.isArray(reportData.suggestions)
    ? reportData.suggestions
    : [];
  // Use backend values directly if present, fallback to 'N/A' only if missing
  const datasetName =
    reportData.dataset_name !== undefined &&
    reportData.dataset_name !== null &&
    reportData.dataset_name !== ""
      ? reportData.dataset_name
      : reportData.filename || reportData.file_name || "N/A";
  const uploadDate =
    reportData.upload_date !== undefined &&
    reportData.upload_date !== null &&
    reportData.upload_date !== ""
      ? reportData.upload_date
      : reportData.created_at || reportData.timestamp || "N/A";
  const overallFairnessScore = reportData.overall_fairness_score ?? "N/A";
  const exportToPDF = () => {
    const element = reportRef.current;
    const opt = {
      margin: 0.5,
      filename: `${reportData.dataset_name}_fairness_report.pdf`,
      image: { type: "jpeg", quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: "in", format: "letter", orientation: "portrait" },
    };
    html2pdf().set(opt).from(element).save();
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8" ref={reportRef}>
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Bias Analysis Report
              </h1>
              <p className="text-gray-600">
                Analysis for {datasetName} • {uploadDate}
              </p>
            </div>
            <div className="flex space-x-3 print:hidden">
              <Button variant="outline" size="sm">
                <Share className="h-4 w-4 mr-2" />
                Share
              </Button>
              {/* <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Export PDF
            </Button> */}
              <Button variant="outline" size="sm" onClick={exportToPDF}>
                <Download className="h-4 w-4 mr-2" />
                Export PDF
              </Button>
            </div>
          </div>

          {/* Overall Score */}
          <Card className="bg-gradient-to-r from-blue-50 to-indigo-50">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">
                    Overall Fairness Score
                  </h3>
                  <p className="text-gray-600">
                    Composite score across all fairness metrics
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-4xl font-bold text-blue-600 mb-1">
                    {overallFairnessScore}/10
                  </div>
                  <div className="flex items-center space-x-1">
                    {getScoreIcon(
                      typeof overallFairnessScore === "number"
                        ? overallFairnessScore / 10
                        : 0
                    )}
                    <span className="text-sm text-gray-500">
                      {typeof overallFairnessScore === "number"
                        ? overallFairnessScore >= 8
                          ? "Good"
                          : overallFairnessScore >= 6
                          ? "Moderate"
                          : "Needs Improvement"
                        : "N/A"}
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Fairness Metrics */}
        <div className="grid lg:grid-cols-4 md:grid-cols-2 gap-6 mb-8">
          <div className="col-span-1">
            <div className="bg-white rounded-xl shadow p-5 h-full flex flex-col justify-between border border-blue-200">
              <div className="mb-2 flex items-center gap-2">
                <span className="text-lg font-semibold text-blue-700">Demographic Parity</span>
                <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">Fairness</span>
              </div>
              <div className="mb-2 text-sm text-gray-600">Equal positive prediction rates across groups</div>
              <div className="mt-2">
                {metrics.demographic_parity && typeof metrics.demographic_parity === "object" && Object.keys(metrics.demographic_parity).length > 0 ? (
                  <ul className="list-disc ml-4">
                    {Object.entries(metrics.demographic_parity).map(([attr, val]) => (
                      <li key={attr} className="mb-1 flex items-center">
                        <span className="font-medium text-gray-800 mr-2">{attr}:</span>
                        <span className="bg-blue-50 text-blue-700 px-2 py-0.5 rounded text-sm font-mono">{typeof val === "number" && !isNaN(val) ? val.toFixed(4) : "N/A"}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <span className="text-gray-400">N/A</span>
                )}
              </div>
            </div>
          </div>

          <div className="col-span-1">
            <div className="bg-white rounded-xl shadow p-5 h-full flex flex-col justify-between border border-blue-200">
              <div className="mb-2 flex items-center gap-2">
                <span className="text-lg font-semibold text-blue-700">Equalized Odds</span>
                <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">Fairness</span>
              </div>
              <div className="mb-2 text-sm text-gray-600">Equal true/false positive rates across groups</div>
              <div className="mt-2">
                {metrics.equalized_odds && typeof metrics.equalized_odds === "object" && Object.keys(metrics.equalized_odds).length > 0 ? (
                  <ul className="list-disc ml-4">
                    {Object.entries(metrics.equalized_odds).map(([attr, val]) => (
                      <li key={attr} className="mb-1 flex items-center">
                        <span className="font-medium text-gray-800 mr-2">{attr}:</span>
                        <span className="bg-blue-50 text-blue-700 px-2 py-0.5 rounded text-sm font-mono">{typeof val === "number" && !isNaN(val) ? val.toFixed(4) : "N/A"}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <span className="text-gray-400">N/A</span>
                )}
              </div>
            </div>
          </div>
          <div className="col-span-1">
            <div className="bg-white rounded-xl shadow p-5 h-full flex flex-col justify-between border border-blue-200">
              <div className="mb-2 flex items-center gap-2">
                <span className="text-lg font-semibold text-blue-700">Calibration</span>
                <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">Fairness</span>
              </div>
              <div className="mb-2 text-sm text-gray-600">Predicted probabilities match actual outcomes</div>
              <div className="mt-2">
                {metrics.calibration && typeof metrics.calibration === "object" && Object.keys(metrics.calibration).length > 0 ? (
                  <ul className="list-disc ml-4">
                    {Object.entries(metrics.calibration).map(([attr, val]) => {
                      // Compute summary verdict and explanation
                      let verdict = "N/A";
                      let explanation = "";
                      let overallScore = null;
                      if (typeof val === "number" && !isNaN(val)) {
                        overallScore = val;
                        verdict = val >= 0.8 ? "Well-calibrated" : val >= 0.6 ? "Moderate calibration" : "Poor calibration";
                        explanation = `Predictions for '${attr}' are ${verdict.toLowerCase()}.`;
                      } else if (typeof val === "object" && val !== null) {
                        const scores = Object.values(val).filter(v => typeof v === "number" && !isNaN(v));
                        if (scores.length > 0) {
                          // Use mean absolute error from perfect calibration (0.5)
                          const mean = scores.reduce((a, b) => a + b, 0) / scores.length;
                          const mae = scores.reduce((a, b) => a + Math.abs(b - 0.5), 0) / scores.length;
                          overallScore = 1 - mae * 2; // 1 = perfect, 0 = worst
                          verdict = overallScore >= 0.8 ? "Well-calibrated" : overallScore >= 0.6 ? "Moderate calibration" : "Poor calibration";
                          explanation = `Predicted probabilities for '${attr}' ${verdict === "Well-calibrated" ? "closely match" : verdict === "Moderate calibration" ? "somewhat match" : "do not match"} actual outcomes.`;
                        } else {
                          verdict = "N/A";
                          explanation = `No calibration data available for '${attr}'.`;
                        }
                      }
                      const bins = typeof val === "object" && val !== null ? Object.entries(val) : [];
                      const showAll = calibrationExpanded[attr] || false;
                      const displayBins = showAll ? bins : bins.slice(0, 5);
                      return (
                        <li key={attr} className="mb-3">
                          <div className="flex items-center mb-1">
                            <span className="font-medium text-gray-800 mr-2">{attr}:</span>
                            <span className={`px-2 py-0.5 rounded text-xs font-semibold ${verdict === "Well-calibrated" ? "bg-green-100 text-green-700" : verdict === "Moderate calibration" ? "bg-yellow-100 text-yellow-700" : verdict === "Poor calibration" ? "bg-red-100 text-red-700" : "bg-gray-100 text-gray-500"}`}>{verdict}</span>
                            {overallScore !== null && (
                              <span className="ml-2 text-xs text-gray-500">Score: {overallScore.toFixed(2)}</span>
                            )}
                          </div>
                          <div className="mb-1 text-xs text-gray-600">{explanation}</div>
                          {typeof val === "number" && !isNaN(val) ? (
                            <span className="bg-blue-50 text-blue-700 px-2 py-0.5 rounded text-sm font-mono">{val.toFixed(4)}</span>
                          ) : typeof val === "object" && val !== null ? (
                            <>
                              <ul className="ml-4 list-disc">
                                {displayBins.map(([bin, score]) => (
                                  <li key={bin} className="text-xs">
                                    <span className="font-mono text-gray-700">{bin}:</span> <span className="bg-blue-50 text-blue-700 px-2 py-0.5 rounded font-mono">{typeof score === "number" && !isNaN(score) ? score.toFixed(4) : "N/A"}</span>
                                  </li>
                                ))}
                              </ul>
                              {bins.length > 5 && (
                                <button
                                  className="text-xs text-blue-600 underline ml-4 mt-1"
                                  onClick={() => setCalibrationExpanded(prev => ({ ...prev, [attr]: !showAll }))}
                                >
                                  {showAll ? "Show Less" : `Show ${bins.length - 5} More`}
                                </button>
                              )}
                            </>
                          ) : (
                            <span className="bg-blue-50 text-blue-700 px-2 py-0.5 rounded text-sm font-mono">N/A</span>
                          )}
                        </li>
                      );
                    })}
                  </ul>
                ) : (
                  <span className="text-gray-400">N/A</span>
                )}
              </div>
            </div>
          </div>
          <MetricCard
            title="Individual Fairness"
            value={metrics.individual_fairness ?? "N/A"}
            description="Similar individuals receive similar outcomes"
          />
        </div>

        {/* Bias Detection Results */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Bias Detection by Sensitive Attribute</CardTitle>
            <CardDescription>
              Analysis of potential bias across different demographic groups
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {biasDetected.length === 0 ? (
                <div className="text-gray-500">
                  No bias detection results available.
                </div>
              ) : (
                biasDetected.map((bias, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-4 border rounded-lg"
                  >
                    <div className="flex items-center space-x-4">
                      <div className="capitalize font-medium text-gray-900">
                        {bias.attribute ?? "N/A"}
                      </div>
                      <Badge variant={getSeverityBadgeVariant(bias.severity)}>
                        {bias.severity ? `${bias.severity} risk` : "N/A"}
                      </Badge>
                    </div>
                    <div className="flex items-center space-x-3">
                      <span
                        className={`font-semibold ${getScoreColor(
                          bias.score ?? 0
                        )}`}
                      >
                        {typeof bias.score === "number"
                          ? (bias.score * 100).toFixed(0) + "%"
                          : "N/A"}
                      </span>
                      {getScoreIcon(
                        typeof bias.score === "number" ? bias.score : 0
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Visualizations */}
        <div className="grid lg:grid-cols-2 gap-8 mb-8">
          <GraphDisplay
            title="Fairness Metrics Comparison"
            type="radar"
            data={metrics}
          />
          <GraphDisplay
            title="Bias Distribution by Group"
            type="bar"
            data={biasDetected}
          />
        </div>

        {/* Suggestions */}
        <SuggestionBox suggestions={suggestions} />
      </div>
    </div>
  );
};

export default ReportPage;
