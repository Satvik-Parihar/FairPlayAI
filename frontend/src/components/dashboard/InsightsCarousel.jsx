
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { Brain, TrendingUp, AlertTriangle, Lightbulb, Target, Zap, ArrowRight, Star } from "lucide-react";

const InsightsCarousel = () => {
  const insights = [
    {
      id: 1,
      type: "bias_alert",
      title: "Gender Bias Detected in Hiring Model",
      description: "Your recruitment algorithm shows 23% bias against female candidates in technical roles. Immediate action recommended.",
      severity: "high",
      icon: AlertTriangle,
      gradient: "from-red-500 to-pink-500",
      action: "Review Model",
      image: "https://images.unsplash.com/photo-1573164713714-d95e436ab8d6?w=400&h=250&fit=crop",
      stats: { affected: "156 decisions", confidence: "94%" }
    },
    {
      id: 2,
      type: "improvement",
      title: "Fairness Score Improved by 15%",
      description: "Your loan approval model now demonstrates significantly better fairness across all demographic groups.",
      severity: "positive",
      icon: TrendingUp,
      gradient: "from-green-500 to-emerald-500",
      action: "View Details",
      image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&h=250&fit=crop",
      stats: { improvement: "+1.2 points", models: "3 affected" }
    },
    {
      id: 3,
      type: "recommendation",
      title: "Optimize Age Distribution Training",
      description: "AI suggests rebalancing your training dataset to include more diverse age groups for better representation.",
      severity: "medium",
      icon: Lightbulb,
      gradient: "from-blue-500 to-cyan-500",
      action: "Apply Fix",
      image: "https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?w=400&h=250&fit=crop",
      stats: { potential: "+8% fairness", effort: "Low" }
    },
    {
      id: 4,
      type: "achievement",
      title: "All Models Now SOC2 Compliant",
      description: "Congratulations! Your entire ML pipeline now meets enterprise security and fairness standards.",
      severity: "positive",
      icon: Target,
      gradient: "from-purple-500 to-indigo-500",
      action: "Download Certificate",
      image: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=400&h=250&fit=crop",
      stats: { compliance: "100%", models: "24 certified" }
    }
  ];

  const getSeverityBadge = (severity) => {
    switch(severity) {
      case "high":
        return "bg-red-100 text-red-700 border-red-200";
      case "medium":
        return "bg-yellow-100 text-yellow-700 border-yellow-200";
      case "positive":
        return "bg-green-100 text-green-700 border-green-200";
      default:
        return "bg-gray-100 text-gray-700 border-gray-200";
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Brain className="h-6 w-6 text-blue-600" />
            AI Insights & Recommendations
          </h2>
          <p className="text-gray-600 mt-1">Intelligent analysis and actionable suggestions for your models</p>
        </div>
        <Badge className="bg-gradient-to-r from-blue-500 to-purple-500 text-white border-0">
          <Zap className="h-3 w-3 mr-1" />
          Powered by AI
        </Badge>
      </div>

      <Carousel className="w-full">
        <CarouselContent className="-ml-2 md:-ml-4">
          {insights.map((insight) => (
            <CarouselItem key={insight.id} className="pl-2 md:pl-4 md:basis-1/2 lg:basis-1/3">
              <Card className="group relative overflow-hidden border-0 shadow-xl bg-white hover:shadow-2xl transition-all duration-500 transform hover:scale-105 h-full">
                {/* Gradient Overlay */}
                <div className={`absolute inset-0 bg-gradient-to-br ${insight.gradient} opacity-5 group-hover:opacity-10 transition-opacity duration-300`} />
                
                {/* Image Header */}
                <div className="relative h-32 overflow-hidden">
                  <img 
                    src={insight.image} 
                    alt={insight.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                  
                  {/* Floating Icon */}
                  <div className={`absolute top-3 right-3 w-10 h-10 bg-gradient-to-br ${insight.gradient} rounded-xl flex items-center justify-center shadow-lg`}>
                    <insight.icon className="h-5 w-5 text-white" />
                  </div>
                  
                  {/* Severity Badge */}
                  <Badge className={`absolute top-3 left-3 ${getSeverityBadge(insight.severity)}`}>
                    {insight.severity === "high" && "Critical"}
                    {insight.severity === "medium" && "Medium"}
                    {insight.severity === "positive" && "Success"}
                  </Badge>
                </div>

                <CardContent className="p-6 relative z-10">
                  <div className="space-y-4">
                    <div>
                      <h3 className="font-bold text-gray-900 group-hover:text-blue-900 transition-colors leading-tight">
                        {insight.title}
                      </h3>
                      <p className="text-sm text-gray-600 mt-2 leading-relaxed">
                        {insight.description}
                      </p>
                    </div>

                    {/* Stats */}
                    <div className="flex flex-wrap gap-2 pt-2 border-t border-gray-100">
                      {Object.entries(insight.stats).map(([key, value]) => (
                        <div key={key} className="text-xs bg-gray-50 rounded-lg px-2 py-1">
                          <span className="text-gray-500 capitalize">{key}:</span>
                          <span className="text-gray-800 font-medium ml-1">{value}</span>
                        </div>
                      ))}
                    </div>

                    {/* Action Button */}
                    <Button 
                      size="sm" 
                      className={`w-full bg-gradient-to-r ${insight.gradient} hover:opacity-90 text-white border-0 group-hover:scale-105 transition-transform`}
                    >
                      {insight.action}
                      <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious className="hidden md:flex" />
        <CarouselNext className="hidden md:flex" />
      </Carousel>
    </div>
  );
};

export default InsightsCarousel;
