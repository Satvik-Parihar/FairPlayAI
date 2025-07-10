
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

  return (
    <Card className={`${getBackgroundColor(value)} transition-all hover:shadow-md`}>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-gray-900">
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between mb-2">
          <div className={`text-2xl font-bold ${getScoreColor(value)}`}>
            {(value * 100).toFixed(0)}%
          </div>
          {getScoreIcon(value)}
        </div>
        <CardDescription className="text-xs text-gray-600">
          {description}
        </CardDescription>
      </CardContent>
    </Card>
  );
};

export default MetricCard;
