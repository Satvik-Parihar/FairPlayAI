
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from "recharts";

const GraphDisplay = ({ title, type, data }) => {
  const renderRadarChart = () => {
    const radarData = Object.entries(data).map(([key, value]) => ({
      metric: key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
      value: value * 100
    }));

    return (
      <ResponsiveContainer width="100%" height={300}>
        <RadarChart data={radarData}>
          <PolarGrid />
          <PolarAngleAxis dataKey="metric" className="text-sm" />
          <PolarRadiusAxis 
            angle={90} 
            domain={[0, 100]} 
            className="text-xs"
          />
          <Radar 
            name="Fairness Score" 
            dataKey="value" 
            stroke="#3B82F6" 
            fill="#3B82F6" 
            fillOpacity={0.3}
            strokeWidth={2}
          />
          <Tooltip 
            formatter={(value) => [`${value.toFixed(1)}%`, 'Fairness Score']}
          />
        </RadarChart>
      </ResponsiveContainer>
    );
  };

  const renderBarChart = () => {
    const barData = data.map(item => ({
      attribute: item.attribute.charAt(0).toUpperCase() + item.attribute.slice(1),
      score: item.score * 100,
      severity: item.severity
    }));

    return (
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={barData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="attribute" />
          <YAxis domain={[0, 100]} />
          <Tooltip 
            formatter={(value) => [`${value.toFixed(1)}%`, 'Fairness Score']}
          />
          <Bar 
            dataKey="score" 
            fill="#3B82F6"
            radius={[4, 4, 0, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">{title}</CardTitle>
        <CardDescription>
          {type === "radar" 
            ? "Comparison of fairness metrics across different criteria"
            : "Bias detection scores by sensitive attributes"
          }
        </CardDescription>
      </CardHeader>
      <CardContent>
        {type === "radar" ? renderRadarChart() : renderBarChart()}
      </CardContent>
    </Card>
  );
};

export default GraphDisplay;
