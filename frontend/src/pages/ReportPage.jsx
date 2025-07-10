
import { useParams } from "react-router-dom";
import { useEffect, useState, useCallback,useRef } from "react";
import { useApi } from "../hooks/useApi";
import { useToast } from "../hooks/use-toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import MetricCard from "../components/MetricCard";
import GraphDisplay from "../components/GraphDisplay";
import SuggestionBox from "../components/SuggestionBox";
import { Download, Share, AlertTriangle, CheckCircle, XCircle } from "lucide-react";
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
  if (score >= 0.6) return <AlertTriangle className="h-5 w-5 text-yellow-600" />;
  return <XCircle className="h-5 w-5 text-red-600" />;
};

const getSeverityBadgeVariant = (severity) => {
  switch(severity) {
    case "high": return "destructive";
    case "medium": return "secondary";
    case "low": return "outline";
    default: return "outline";
  }
};

const ReportPage = () => {
  const { reportId } = useParams();
  const [reportData, setReportData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const { getReport } = useApi();
  const { toast } = useToast();
  const reportRef = useRef(); // 📌 Add this

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
        description: err.response?.data?.error || "Failed to load report data",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  fetchReport();
}, [reportId]);


  if (isLoading) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }

  if (error || !reportData) {
    return (
      <div className="flex flex-col justify-center items-center h-screen gap-4">
        <p>Report not found or failed to load</p>
        <Button onClick={fetchReport}>Retry</Button>
      </div>
    );
  }
const exportToPDF = () => {
  const element = reportRef.current;
  const opt = {
    margin:       0.5,
    filename:     `${reportData.dataset_name}_fairness_report.pdf`,
    image:        { type: 'jpeg', quality: 0.98 },
    html2canvas:  { scale: 2 },
    jsPDF:        { unit: 'in', format: 'letter', orientation: 'portrait' }
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
              Analysis for {reportData.dataset_name} • {reportData.upload_date}
            </p>
          </div>
          <div className="flex space-x-3">
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
                  {reportData.overall_fairness_score}/10
                </div>
                <div className="flex items-center space-x-1">
                  {getScoreIcon(reportData.overall_fairness_score / 10)}
                  <span className="text-sm text-gray-500">
                    {reportData.overall_fairness_score >= 8 ? "Good" : 
                     reportData.overall_fairness_score >= 6 ? "Moderate" : "Needs Improvement"}
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Fairness Metrics */}
      <div className="grid lg:grid-cols-4 md:grid-cols-2 gap-6 mb-8">
        <MetricCard
          title="Demographic Parity"
          value={reportData.metrics.demographic_parity}
          description="Equal positive prediction rates across groups"
        />
        <MetricCard
          title="Equalized Odds"
          value={reportData.metrics.equalized_odds}
          description="Equal true/false positive rates across groups"
        />
        <MetricCard
          title="Calibration"
          value={reportData.metrics.calibration}
          description="Predicted probabilities match actual outcomes"
        />
        <MetricCard
          title="Individual Fairness"
          value={reportData.metrics.individual_fairness}
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
            {reportData.bias_detected.map((bias, index) => (
              <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center space-x-4">
                  <div className="capitalize font-medium text-gray-900">
                    {bias.attribute}
                  </div>
                  <Badge variant={getSeverityBadgeVariant(bias.severity)}>
                    {bias.severity} risk
                  </Badge>
                </div>
                <div className="flex items-center space-x-3">
                  <span className={`font-semibold ${getScoreColor(bias.score)}`}>
                    {(bias.score * 100).toFixed(0)}%
                  </span>
                  {getScoreIcon(bias.score)}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Visualizations */}
      <div className="grid lg:grid-cols-2 gap-8 mb-8">
        <GraphDisplay
          title="Fairness Metrics Comparison"
          type="radar"
          data={reportData.metrics}
        />
        <GraphDisplay
          title="Bias Distribution by Group"
          type="bar"
          data={reportData.bias_detected}
        />
      </div>

      {/* Suggestions */}
      <SuggestionBox suggestions={reportData.suggestions} />
    </div>
    </div>

  );
};

export default ReportPage;
