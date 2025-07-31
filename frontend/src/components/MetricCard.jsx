
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, AlertTriangle, XCircle } from "lucide-react";

const MetricCard = ({ title, value, description }) => {
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

  const getBackgroundColor = (score) => {
    if (score >= 0.8) return "bg-green-50 border-green-200";
    if (score >= 0.6) return "bg-yellow-50 border-yellow-200";
    return "bg-red-50 border-red-200";
  };

  // Helper to render metric value(s)
  // Recursively render metric value(s) to handle deeply nested objects
  const renderMetricValue = (val) => {
    if (typeof val === "number") return isNaN(val) ? "N/A" : val.toFixed(4);
    if (val === null || val === undefined) return "N/A";
    if (typeof val === "object" && val !== null) {
      const subEntries = Object.entries(val);
      return subEntries.map(([k, v]) => {
        if (typeof v === "object" && v !== null) {
          return `${k}: { ${renderMetricValue(v)} }`;
        }
        return `${k}: ${typeof v === "number" ? (isNaN(v) ? "N/A" : v.toFixed(4)) : v}`;
      }).join(", ");
    }
    return val;
  };

  // If value is an object, render a list of attribute values
  let isObject = typeof value === "object" && value !== null;
  let entries = isObject ? Object.entries(value) : [];
  let allNaN = isObject && entries.every(([, v]) => v === null || v === undefined || (typeof v === "number" && isNaN(v)));

  return (
    <Card className={`${!isObject ? getBackgroundColor(value) : "bg-gray-50 border-gray-200"} transition-all hover:shadow-md`}>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-gray-900">
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {!isObject ? (
          <div className="flex items-center justify-between mb-2">
            <div className={`text-2xl font-bold ${getScoreColor(value)}`}>
              {typeof value === "number" && !isNaN(value) ? (value * 100).toFixed(0) + "%" : renderMetricValue(value)}
            </div>
            {typeof value === "number" && !isNaN(value) ? getScoreIcon(value) : null}
          </div>
        ) : (
          <div className="mb-2">
            {entries.length === 0 || allNaN ? (
              <span className="text-lg font-bold">N/A</span>
            ) : (
              <ul className="ml-2 list-disc">
                {entries.map(([attr, val]) => (
                  <li key={attr} className="text-base">
                    {`${attr}: ${renderMetricValue(val)}`}
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
        <CardDescription className="text-xs text-gray-600">
          {description}
        </CardDescription>
      </CardContent>
    </Card>
  );
};

export default MetricCard;
