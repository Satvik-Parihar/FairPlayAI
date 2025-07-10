
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, Activity, Brain, Shield, Zap, AlertTriangle, CheckCircle, Target, BarChart } from "lucide-react";

const AnalyticsOverview = () => {
  const metrics = [
    {
      title: "Total Analyses",
      value: "2,847",
      change: "+12.5%",
      changeType: "positive",
      icon: Activity,
      gradient: "from-blue-500 to-cyan-500",
      description: "This month",
      trend: [65, 70, 68, 75, 72, 78, 82, 85, 88, 90, 85, 92]
    },
    {
      title: "Bias Detection Rate",
      value: "98.7%",
      change: "+2.1%",
      changeType: "positive", 
      icon: Brain,
      gradient: "from-emerald-500 to-green-500",
      description: "Accuracy improved",
      trend: [78, 82, 85, 87, 89, 92, 94, 96, 97, 98, 98.5, 98.7]
    },
    {
      title: "Critical Issues",
      value: "7",
      change: "-23%",
      changeType: "positive",
      icon: AlertTriangle,
      gradient: "from-orange-500 to-red-500",
      description: "Resolved this week",
      trend: [15, 13, 12, 10, 9, 8, 9, 7, 6, 7, 8, 7]
    },
    {
      title: "Fairness Score",
      value: "8.9/10",
      change: "+0.4",
      changeType: "positive",
      icon: Shield,
      gradient: "from-purple-500 to-pink-500",
      description: "Average across models",
      trend: [7.8, 8.0, 8.1, 8.3, 8.5, 8.4, 8.6, 8.7, 8.8, 8.9, 8.8, 8.9]
    }
  ];

  const achievements = [
    { icon: Target, label: "100% Compliance", color: "text-green-600" },
    { icon: Zap, label: "Real-time Analysis", color: "text-blue-600" },
    { icon: CheckCircle, label: "SOC2 Certified", color: "text-purple-600" }
  ];

  return (
    <div className="space-y-6">
      {/* Main Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {metrics.map((metric, index) => (
          <Card key={index} className="group relative overflow-hidden border-0 shadow-xl bg-white/80 backdrop-blur-xl hover:shadow-2xl transition-all duration-500 transform hover:scale-105">
            {/* Gradient Background */}
            <div className={`absolute inset-0 bg-gradient-to-br ${metric.gradient} opacity-5 group-hover:opacity-10 transition-opacity duration-300`} />
            
            {/* Animated Border */}
            <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 transform -skew-x-12" />
            
            <CardContent className="p-6 relative z-10">
              <div className="flex items-start justify-between mb-4">
                <div className={`w-14 h-14 bg-gradient-to-br ${metric.gradient} rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300`}>
                  <metric.icon className="h-7 w-7 text-white" />
                </div>
                
                <div className={`flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${
                  metric.changeType === "positive" 
                    ? "bg-green-100 text-green-700" 
                    : "bg-red-100 text-red-700"
                }`}>
                  {metric.changeType === "positive" ? (
                    <TrendingUp className="w-4 h-4" />
                  ) : (
                    <TrendingDown className="w-4 h-4" />
                  )}
                  {metric.change}
                </div>
              </div>
              
              <div className="space-y-2">
                <h3 className="text-sm font-medium text-gray-600 group-hover:text-gray-700 transition-colors">
                  {metric.title}
                </h3>
                <div className="text-3xl font-bold text-gray-900 group-hover:text-gray-800 transition-colors">
                  {metric.value}
                </div>
                <p className="text-sm text-gray-500">
                  {metric.description}
                </p>
              </div>
              
              {/* Mini Trend Chart */}
              <div className="mt-4 h-8 flex items-end space-x-1">
                {metric.trend.map((value, idx) => (
                  <div
                    key={idx}
                    className={`flex-1 bg-gradient-to-t ${metric.gradient} rounded-sm opacity-70 group-hover:opacity-100 transition-opacity duration-300`}
                    style={{ height: `${(value / Math.max(...metric.trend)) * 100}%` }}
                  />
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Achievements Banner */}
      <Card className="border-0 shadow-xl bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 overflow-hidden">
        <CardContent className="p-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="space-y-2">
              <h3 className="text-xl font-bold text-gray-900">
                🎉 Platform Achievements
              </h3>
              <p className="text-gray-600">
                Your AI fairness journey milestones and certifications
              </p>
            </div>
            
            <div className="flex flex-wrap gap-4">
              {achievements.map((achievement, index) => (
                <div key={index} className="flex items-center gap-2 bg-white/80 backdrop-blur-sm rounded-lg px-4 py-3 shadow-sm">
                  <achievement.icon className={`h-5 w-5 ${achievement.color}`} />
                  <span className="font-medium text-gray-800">{achievement.label}</span>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AnalyticsOverview;
