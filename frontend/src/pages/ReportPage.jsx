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
  const problemType =
    reportData && reportData.problem_type ? reportData.problem_type : null;
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
    if (reportData.metrics && reportData.metrics.regression_fairness) {
      // eslint-disable-next-line no-console
      console.log("Regression Fairness metrics from backend:", reportData.metrics.regression_fairness);
    }
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
  // Always fallback to [] if bias_detected is null/undefined
  const biasDetected = Array.isArray(reportData.bias_detected)
    ? reportData.bias_detected
    : reportData.bias_detected && typeof reportData.bias_detected === 'object'
      ? Object.values(reportData.bias_detected)
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
  let uploadDate =
    reportData.upload_date !== undefined &&
    reportData.upload_date !== null &&
    reportData.upload_date !== ""
      ? reportData.upload_date
      : reportData.created_at || reportData.timestamp || "N/A";
  // Only show date part if uploadDate is ISO string
  if (uploadDate && typeof uploadDate === "string" && uploadDate.includes("T")) {
    uploadDate = uploadDate.split("T")[0];
  }
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
                  {(() => {
                    let score = overallFairnessScore;
                    if (typeof score !== "number") {
                      score = parseFloat(score);
                    }
                    let colorClass = "text-red-700 bg-red-50";
                    if (!isNaN(score)) {
                      if (score >= 8) {
                        colorClass = "text-green-700 bg-green-50";
                      } else if (score >= 6) {
                        colorClass = "text-yellow-700 bg-yellow-50";
                      }
                    }
                    return (
                      <>
                        <div
                          className={`text-4xl font-bold mb-1 inline-block px-4 py-2 rounded ${colorClass}`}
                        >
                          {!isNaN(score) ? score.toFixed(2) : "N/A"}/10
                        </div>
                        <div className="flex items-center space-x-1 mt-1">
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
                      </>
                    );
                  })()}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Fairness Metrics */}

      {problemType === "regression" ? (
        // Refactored: Each sensitive attribute gets its own card, with group metrics as a table
        <div className={`grid ${metrics.regression_fairness && Object.keys(metrics.regression_fairness).length === 1 ? 'grid-cols-1' : 'lg:grid-cols-2 md:grid-cols-1'} gap-6 mb-8`}>
          {metrics.regression_fairness && Object.keys(metrics.regression_fairness).length > 0 ? (
            Object.entries(metrics.regression_fairness).map(([attr, groupMetrics], idx, arr) => {
              // Collect all group names for this attribute
              const groupNames = Array.from(
                new Set(
                  [
                    ...(groupMetrics.group_mae ? Object.keys(groupMetrics.group_mae) : []),
                    ...(groupMetrics.group_r2 ? Object.keys(groupMetrics.group_r2) : []),
                    ...(groupMetrics.group_residuals ? Object.keys(groupMetrics.group_residuals) : []),
                    ...(groupMetrics.group_mean_prediction ? Object.keys(groupMetrics.group_mean_prediction) : []),
                  ]
                )
              );
              return (
                <Card
                  key={attr}
                  className={`h-full flex flex-col max-h-[420px] ${arr.length === 1 ? 'col-span-full' : ''}`}
                >
                  <CardHeader>
                    <CardTitle className="capitalize text-blue-700">{attr}</CardTitle>
                    <CardDescription>Group-wise regression metrics</CardDescription>
                  </CardHeader>
                  <CardContent className="flex-1 overflow-y-auto">
                    <div className="overflow-x-auto">
                      <table className="min-w-full text-sm text-left">
                        <thead>
                          <tr className="bg-blue-100 text-blue-700">
                            <th className="px-3 py-2 font-semibold">Group</th>
                            <th className="px-3 py-2 font-semibold">MAE</th>
                            <th className="px-3 py-2 font-semibold">R²</th>
                            <th className="px-3 py-2 font-semibold">Residual</th>
                            <th className="px-3 py-2 font-semibold">Mean Prediction</th>
                          </tr>
                        </thead>
                        <tbody>
                          {groupNames.map((group) => {
                            const mae = groupMetrics.group_mae?.[group];
                            const r2 = groupMetrics.group_r2?.[group];
                            const resid = groupMetrics.group_residuals?.[group];
                            const meanPred = groupMetrics.group_mean_prediction?.[group];
                            // Color for R²
                            let r2Color = "bg-blue-50 text-blue-700";
                            if (r2 !== null && r2 !== undefined && !isNaN(r2)) {
                              if (r2 > 0.5) r2Color = "bg-green-100 text-green-700";
                              else if (r2 >= 0) r2Color = "bg-yellow-100 text-yellow-700";
                              else r2Color = "bg-red-100 text-red-700";
                            }
                            return (
                              <tr key={group} className="border-b last:border-b-0">
                                <td className="px-3 py-2 font-mono text-gray-700">{group}</td>
                                <td className="px-3 py-2">
                                  {mae === null || mae === undefined || isNaN(mae)
                                    ? <span className="text-gray-400">Insufficient data</span>
                                    : mae.toFixed(4)}
                                </td>
                                <td className={`px-3 py-2 ${r2Color}`}>
                                  {r2 === null || r2 === undefined || isNaN(r2)
                                    ? <span className="text-gray-400">Insufficient data</span>
                                    : r2.toFixed(4)}
                                </td>
                                <td className="px-3 py-2">
                                  {resid === null || resid === undefined || isNaN(resid)
                                    ? <span className="text-gray-400">Insufficient data</span>
                                    : resid.toFixed(4)}
                                </td>
                                <td className="px-3 py-2">
                                  {meanPred === null || meanPred === undefined || isNaN(meanPred)
                                    ? <span className="text-gray-400">Insufficient data</span>
                                    : meanPred.toFixed(4)}
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </CardContent>
                </Card>
              );
            })
          ) : (
            <div className="text-gray-500 col-span-full">No regression fairness metrics available.</div>
          )}
          {/* Overall Fairness Score for Regression */}
          {typeof metrics.overall_fairness_score === "number" && !isNaN(metrics.overall_fairness_score) && (
            <Card className="col-span-full mt-4">
              <CardContent>
                <div className="text-base font-semibold text-gray-800 mb-1">Overall Fairness Score</div>
                <div className="text-sm text-gray-600 mb-2">Aggregated fairness score across sensitive attributes. Higher is better.</div>
                {(() => {
                  let score = metrics.overall_fairness_score;
                  if (typeof score !== "number") {
                    score = parseFloat(score);
                  }
                  let colorClass = "bg-red-50 text-red-700";
                  if (!isNaN(score)) {
                    if (score >= 8) {
                      colorClass = "bg-green-50 text-green-700";
                    } else if (score >= 6) {
                      colorClass = "bg-yellow-50 text-yellow-700";
                    }
                  }
                  return (
                    <div className={`inline-block ${colorClass} px-3 py-1 rounded text-lg font-mono shadow`}>
                      {!isNaN(score) ? score.toFixed(4) : "N/A"}
                    </div>
                  );
                })()}
              </CardContent>
            </Card>
          )}
        </div>
      ) :
         (
          <div className="grid lg:grid-cols-4 md:grid-cols-2 gap-6 mb-8">
            <div className="col-span-1">
              <div className="bg-white rounded-xl shadow p-5 h-full flex flex-col justify-between border border-blue-200 max-h-[520px]">
                <div className="flex-1 overflow-y-auto">
                  <div className="mb-2 flex items-center gap-2">
                    <span className="text-lg font-semibold text-blue-700">
                      Demographic Parity
                    </span>
                    <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
                      Fairness
                    </span>
                  </div>
                  <div className="mb-2 text-sm text-gray-600">
                    Equal positive prediction rates across groups
                  </div>
                  <div className="mt-2">
                    {metrics.demographic_parity &&
                    typeof metrics.demographic_parity === "object" &&
                    Object.keys(metrics.demographic_parity).length > 0 ? (
                      <ul className="list-disc ml-4">
                        {Object.entries(metrics.demographic_parity).map(
                          ([attr, val]) => (
                            <li key={attr} className="mb-1 flex items-center">
                              <span className="font-medium text-gray-800 mr-2">
                                {attr}:
                              </span>
                              <span className="bg-blue-50 text-blue-700 px-2 py-0.5 rounded text-sm font-mono">
                                {typeof val === "number" && !isNaN(val)
                                  ? val.toFixed(4)
                                  : "N/A"}
                              </span>
                            </li>
                          )
                        )}
                      </ul>
                    ) : (
                      <span className="text-gray-400">N/A</span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="col-span-1">
              <div className="bg-white rounded-xl shadow p-5 h-full flex flex-col justify-between border border-blue-200 max-h-[520px]">
                <div className="flex-1 overflow-y-auto">
                  <div className="mb-2 flex items-center gap-2">
                    <span className="text-lg font-semibold text-blue-700">
                      Equalized Odds
                    </span>
                    <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
                      Fairness
                    </span>
                  </div>
                  <div className="mb-2 text-sm text-gray-600">
                    Equal true/false positive rates across groups
                  </div>
                  <div className="mt-2">
                    {metrics.equalized_odds &&
                    typeof metrics.equalized_odds === "object" &&
                    Object.keys(metrics.equalized_odds).length > 0 ? (
                      <ul className="list-disc ml-4">
                        {Object.entries(metrics.equalized_odds).map(
                          ([attr, val]) => (
                            <li key={attr} className="mb-1 flex items-center">
                              <span className="font-medium text-gray-800 mr-2">
                                {attr}:
                              </span>
                              <span className="bg-blue-50 text-blue-700 px-2 py-0.5 rounded text-sm font-mono">
                                {typeof val === "number" && !isNaN(val)
                                  ? val.toFixed(4)
                                  : "N/A"}
                              </span>
                            </li>
                          )
                        )}
                      </ul>
                    ) : (
                      <span className="text-gray-400">N/A</span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="col-span-1">
              <div className="bg-white rounded-xl shadow p-5 h-full flex flex-col justify-between border border-blue-200 max-h-[520px]">
                <div className="flex-1 overflow-y-auto">
                  <div className="mb-2 flex items-center gap-2">
                    <span className="text-lg font-semibold text-blue-700">
                      Calibration
                    </span>
                    <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
                      Fairness
                    </span>
                  </div>
                  <div className="mb-2 text-sm text-gray-600">
                    Predicted probabilities match actual outcomes
                  </div>
                  <div className="mt-2">
                    {metrics.calibration &&
                    typeof metrics.calibration === "object" &&
                    Object.keys(metrics.calibration).length > 0 ? (
                      <ul className="list-disc ml-4">
                        {Object.entries(metrics.calibration).map(
                          ([attr, val]) => {
                            let verdict = "N/A";
                            let explanation = "";
                            let overallScore = null;

                            if (typeof val === "number" && !isNaN(val)) {
                              overallScore = val;
                              verdict =
                                val >= 0.8
                                  ? "Well-calibrated"
                                  : val >= 0.6
                                  ? "Moderate calibration"
                                  : "Poor calibration";
                              explanation = `Predictions for '${attr}' are ${verdict.toLowerCase()}.`;
                            } else if (
                              typeof val === "object" &&
                              val !== null
                            ) {
                              const scores = Object.values(val).filter(
                                (v) => typeof v === "number" && !isNaN(v)
                              );
                              if (scores.length > 0) {
                                const mean =
                                  scores.reduce((a, b) => a + b, 0) /
                                  scores.length;
                                const mae =
                                  scores.reduce(
                                    (a, b) => a + Math.abs(b - 0.5),
                                    0
                                  ) / scores.length;
                                overallScore = 1 - mae * 2;
                                verdict =
                                  overallScore >= 0.8
                                    ? "Well-calibrated"
                                    : overallScore >= 0.6
                                    ? "Moderate calibration"
                                    : "Poor calibration";
                                explanation = `Predicted probabilities for '${attr}' ${
                                  verdict === "Well-calibrated"
                                    ? "closely match"
                                    : verdict === "Moderate calibration"
                                    ? "somewhat match"
                                    : "do not match"
                                } actual outcomes.`;
                              } else {
                                verdict = "N/A";
                                explanation = `No calibration data available for '${attr}'.`;
                              }
                            }

                            const bins =
                              typeof val === "object" && val !== null
                                ? Object.entries(val)
                                : [];
                            const showAll = calibrationExpanded[attr] || false;
                            const displayBins = showAll
                              ? bins
                              : bins.slice(0, 5);

                            return (
                              <li key={attr} className="mb-3">
                                <div className="flex items-center mb-1">
                                  <span className="font-medium text-gray-800 mr-2">
                                    {attr}:
                                  </span>
                                  <span
                                    className={`px-2 py-0.5 rounded text-xs font-semibold ${
                                      verdict === "Well-calibrated"
                                        ? "bg-green-100 text-green-700"
                                        : verdict === "Moderate calibration"
                                        ? "bg-yellow-100 text-yellow-700"
                                        : verdict === "Poor calibration"
                                        ? "bg-red-100 text-red-700"
                                        : "bg-gray-100 text-gray-500"
                                    }`}
                                  >
                                    {verdict}
                                  </span>
                                  {overallScore !== null && (
                                    <span className="ml-2 text-xs text-gray-500">
                                      Score: {overallScore.toFixed(2)}
                                    </span>
                                  )}
                                </div>
                                <div className="mb-1 text-xs text-gray-600">
                                  {explanation}
                                </div>
                                {typeof val === "number" && !isNaN(val) ? (
                                  <span className="bg-blue-50 text-blue-700 px-2 py-0.5 rounded text-sm font-mono">
                                    {val.toFixed(4)}
                                  </span>
                                ) : typeof val === "object" && val !== null ? (
                                  <>
                                    <ul className="ml-4 list-disc">
                                      {displayBins.map(([bin, score]) => (
                                        <li key={bin} className="text-xs">
                                          <span className="font-mono text-gray-700">
                                            {bin}:
                                          </span>{" "}
                                          <span className="bg-blue-50 text-blue-700 px-2 py-0.5 rounded font-mono">
                                            {typeof score === "number" &&
                                            !isNaN(score)
                                              ? score.toFixed(4)
                                              : "N/A"}
                                          </span>
                                        </li>
                                      ))}
                                    </ul>
                                    {bins.length > 5 && (
                                      <button
                                        className="text-xs text-blue-600 underline ml-4 mt-1"
                                        onClick={() =>
                                          setCalibrationExpanded((prev) => ({
                                            ...prev,
                                            [attr]: !showAll,
                                          }))
                                        }
                                      >
                                        {showAll
                                          ? "Show Less"
                                          : `Show ${bins.length - 5} More`}
                                      </button>
                                    )}
                                  </>
                                ) : (
                                  <span className="bg-blue-50 text-blue-700 px-2 py-0.5 rounded text-sm font-mono">
                                    N/A
                                  </span>
                                )}
                              </li>
                            );
                          }
                        )}
                      </ul>
                    ) : (
                      <span className="text-gray-400">N/A</span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="col-span-1">
              <div className="bg-white rounded-xl shadow p-5 h-full flex flex-col justify-between border border-blue-200 min-h-[420px] max-h-[520px] overflow-hidden">
                <div className="flex-1 overflow-y-auto">
                  <div className="mb-2 flex items-center gap-2">
                    <span className="text-lg font-semibold text-blue-700">
                      Individual Fairness
                    </span>
                    <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
                      Fairness
                    </span>
                  </div>
                  <div className="mb-2 text-sm text-gray-600">
                    Similar individuals receive similar outcomes
                  </div>
                  <div className="mt-2">
                    {(() => {
                      const val = metrics.individual_fairness;
                      if (
                        val === undefined ||
                        val === null ||
                        (typeof val === "number" && isNaN(val)) ||
                        (typeof val === "object" &&
                          Object.keys(val).length === 0)
                      ) {
                        return <span className="text-gray-400">N/A</span>;
                      }
                      // Helper to summarize and format group values
                      function summarizeGroup(obj) {
                        const entries = Object.entries(obj).filter(
                          ([k, v]) => typeof v === "number" && !isNaN(v)
                        );
                        if (entries.length === 0) return null;
                        const avg =
                          entries.reduce((a, [k, v]) => a + v, 0) /
                          entries.length;
                        return avg;
                      }
                      // Helper to collapse long lists
                      function CollapsibleList({ entries, max = 10, label }) {
                        const [expanded, setExpanded] = useState(false);
                        const display = expanded
                          ? entries
                          : entries.slice(0, max);
                        return (
                          <>
                            <ul className="ml-4 list-disc">
                              {display.map(([k, v], idx) => (
                                <li
                                  key={k + idx}
                                  className="flex items-center mb-1"
                                >
                                  <span className="font-mono text-gray-700 mr-2">
                                    {k}:
                                  </span>
                                  <span className="bg-blue-50 text-blue-700 px-2 py-0.5 rounded font-mono">
                                    {typeof v === "number" && !isNaN(v)
                                      ? v.toFixed(4)
                                      : String(v)}
                                  </span>
                                </li>
                              ))}
                            </ul>
                            {entries.length > max && (
                              <button
                                className="text-xs text-blue-600 underline ml-4 mt-1"
                                onClick={() => setExpanded((e) => !e)}
                              >
                                {expanded
                                  ? "Show Less"
                                  : `Show ${entries.length - max} More`}
                              </button>
                            )}
                          </>
                        );
                      }
                      // Main rendering logic
                      if (typeof val === "number") {
                        return (
                          <div>
                            <span className="font-semibold text-gray-800">
                              Overall Individual Fairness Score:
                            </span>
                            <span className="bg-blue-50 text-blue-700 px-2 py-0.5 rounded text-sm font-mono ml-2">
                              {val.toFixed(4)}
                            </span>
                            <div className="text-xs text-gray-600 mt-1">
                              Higher values mean similar individuals receive
                              similar outcomes.
                            </div>
                          </div>
                        );
                      }
                      if (typeof val === "object" && val !== null) {
                        return (
                          <div>
                            {Object.entries(val).map(([group, groupVal]) => {
                              if (typeof groupVal === "number") {
                                return (
                                  <div key={group} className="mb-2">
                                    <span className="font-semibold text-gray-800">
                                      {group}:
                                    </span>
                                    <span className="bg-blue-50 text-blue-700 px-2 py-0.5 rounded text-sm font-mono ml-2">
                                      {groupVal.toFixed(4)}
                                    </span>
                                    <span className="text-xs text-gray-600 ml-2">
                                      Average similarity of predictions for
                                      individuals in{" "}
                                      <span className="font-mono">{group}</span>
                                      .
                                    </span>
                                  </div>
                                );
                              }
                              if (
                                typeof groupVal === "object" &&
                                groupVal !== null
                              ) {
                                const entries = Object.entries(groupVal);
                                const avg = summarizeGroup(groupVal);
                                return (
                                  <div key={group} className="mb-2">
                                    <span className="font-semibold text-gray-800">
                                      {group}:
                                    </span>
                                    {avg !== null && (
                                      <span className="bg-blue-50 text-blue-700 px-2 py-0.5 rounded text-sm font-mono ml-2">
                                        Avg: {avg.toFixed(4)}
                                      </span>
                                    )}
                                    <span className="text-xs text-gray-600 ml-2">
                                      Similarity scores for each value in{" "}
                                      <span className="font-mono">{group}</span>
                                      :
                                    </span>
                                    <CollapsibleList
                                      entries={entries}
                                      max={10}
                                      label={group}
                                    />
                                  </div>
                                );
                              }
                              return null;
                            })}
                            <div className="text-xs text-gray-600 mt-2">
                              Higher values mean similar individuals receive
                              similar outcomes. Scores are averaged per group or
                              value.
                            </div>
                          </div>
                        );
                      }
                      return <span className="text-gray-400">N/A</span>;
                    })()}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

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
          {/* Prepare radar chart data: use mean value for object metrics */}
          {(() => {
            // Recursively collect all numbers from a value (number, object, array)
            function collectNumbers(val) {
              if (typeof val === "number" && !isNaN(val)) return [val];
              if (Array.isArray(val)) return val.flatMap(collectNumbers);
              if (typeof val === "object" && val !== null)
                return Object.values(val).flatMap(collectNumbers);
              return [];
            }
            const radarMetrics = {};
            for (const [key, value] of Object.entries(metrics)) {
              const nums = collectNumbers(value);
              radarMetrics[key] =
                nums.length > 0
                  ? nums.reduce((a, b) => a + b, 0) / nums.length
                  : NaN;
            }
            return (
              <GraphDisplay
                title="Fairness Metrics Comparison"
                type="radar"
                data={radarMetrics}
              />
            );
          })()}
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

// export default ReportPage;

// Legend/Guide Modal component
// import { useState } from "react";

const LegendGuideModal = ({ open, onClose }) => {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <div className="bg-white rounded-lg shadow-lg max-w-sm w-full p-6 relative">
        <button
          className="absolute top-2 right-2 text-gray-400 hover:text-gray-700 text-xl font-bold"
          onClick={onClose}
          aria-label="Close legend"
        >
          ×
        </button>
        <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
          <span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded text-base font-bold">?</span>
          Fairness Metrics Legend
        </h2>
        <ul className="space-y-3 mt-2">
          <li className="flex items-center gap-3">
            <CheckCircle className="h-5 w-5 text-green-600" />
            <span className="bg-green-100 text-green-700 px-2 py-0.5 rounded font-mono">Green</span>
            <span className="text-gray-700">Fair / Low Bias</span>
          </li>
          <li className="flex items-center gap-3">
            <AlertTriangle className="h-5 w-5 text-yellow-600" />
            <span className="bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded font-mono">Yellow</span>
            <span className="text-gray-700">Moderate concern</span>
          </li>
          <li className="flex items-center gap-3">
            <XCircle className="h-5 w-5 text-red-600" />
            <span className="bg-red-100 text-red-700 px-2 py-0.5 rounded font-mono">Red</span>
            <span className="text-gray-700">Unfair / High Bias</span>
          </li>
        </ul>
        <div className="mt-4 text-xs text-gray-500">
          These colors and icons are used throughout the report to indicate fairness levels for metrics, groups, and charts.
        </div>
      </div>
    </div>
  );
};

const FloatingLegendButton = ({ onClick }) => (
  <button
    className="fixed bottom-6 right-6 z-40 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-lg w-12 h-12 flex items-center justify-center text-2xl font-bold focus:outline-none focus:ring-2 focus:ring-blue-400"
    onClick={onClick}
    aria-label="Show legend/guide"
    title="Show legend/guide"
    type="button"
  >
    ?
  </button>
);

const ReportPageWithLegend = () => {
  const [legendOpen, setLegendOpen] = useState(false);
  return (
    <>
      <ReportPage />
      <FloatingLegendButton onClick={() => setLegendOpen(true)} />
      <LegendGuideModal open={legendOpen} onClose={() => setLegendOpen(false)} />
    </>
  );
};

export default ReportPageWithLegend;