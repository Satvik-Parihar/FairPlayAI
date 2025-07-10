
import { TrendingUp, TrendingDown } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const StatsCard = ({ 
  title, 
  value, 
  change, 
  changeType = "positive", 
  icon: Icon, 
  gradient = "from-blue-500 to-purple-500",
  className = "" 
}) => {
  return (
    <Card className={`group relative overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 ${className}`}>
      {/* Gradient Background */}
      <div className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-5 group-hover:opacity-10 transition-opacity duration-300`} />
      
      <CardContent className="p-6 relative z-10">
        <div className="flex items-center justify-between mb-4">
          <div className={`w-12 h-12 bg-gradient-to-br ${gradient} rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
            <Icon className="h-6 w-6 text-white" />
          </div>
          
          {change && (
            <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
              changeType === "positive" 
                ? "bg-green-100 text-green-700" 
                : "bg-red-100 text-red-700"
            }`}>
              {changeType === "positive" ? (
                <TrendingUp className="w-3 h-3" />
              ) : (
                <TrendingDown className="w-3 h-3" />
              )}
              {change}
            </div>
          )}
        </div>
        
        <div>
          <div className="text-2xl font-bold text-gray-900 mb-1">
            {value}
          </div>
          <div className="text-sm text-gray-600 font-medium">
            {title}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default StatsCard;
