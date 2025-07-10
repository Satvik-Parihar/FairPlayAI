
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Upload, Brain, BarChart3, Shield, Target, Zap, CheckCircle, TrendingUp, Users } from "lucide-react";

const FeaturesSection = () => {
  const [hoveredFeature, setHoveredFeature] = useState(null);

  const features = [
    {
      icon: Upload,
      title: "Drag & Drop Upload",
      description: "Seamlessly upload CSV datasets and ML models with our intuitive drag-and-drop interface",
      gradient: "from-blue-500 to-cyan-500",
      bgColor: "bg-blue-50",
      iconColor: "text-blue-600",
      stats: "2-click setup"
    },
    {
      icon: Brain,
      title: "AI-Powered Detection",
      description: "Advanced neural networks automatically detect bias patterns across multiple sensitive attributes",
      gradient: "from-purple-500 to-pink-500",
      bgColor: "bg-purple-50",
      iconColor: "text-purple-600",
      stats: "99.2% accuracy"
    },
    {
      icon: BarChart3,
      title: "Interactive Reports",
      description: "Rich visualizations with interactive charts, heatmaps, and comprehensive bias analysis dashboards",
      gradient: "from-green-500 to-emerald-500",
      bgColor: "bg-green-50",
      iconColor: "text-green-600",
      stats: "15+ chart types"
    },
    {
      icon: Shield,
      title: "Enterprise Security",
      description: "Bank-grade encryption, GDPR compliance, and secure data processing with zero data retention",
      gradient: "from-orange-500 to-red-500",
      bgColor: "bg-orange-50",
      iconColor: "text-orange-600",
      stats: "SOC2 compliant"
    },
    {
      icon: Target,
      title: "Multi-Attribute Analysis",
      description: "Detect bias across gender, race, age, income, education, and custom demographic attributes",
      gradient: "from-indigo-500 to-blue-500",
      bgColor: "bg-indigo-50",
      iconColor: "text-indigo-600",
      stats: "20+ attributes"
    },
    {
      icon: Zap,
      title: "Lightning Fast",
      description: "Get comprehensive bias analysis results in under 3 minutes for datasets up to 1M records",
      gradient: "from-yellow-500 to-orange-500",
      bgColor: "bg-yellow-50",
      iconColor: "text-yellow-600",
      stats: "< 3min results"
    }
  ];

  return (
    <section className="py-32 bg-gradient-to-b from-gray-50 to-white relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 bg-grid-pattern opacity-5" />
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-200/20 rounded-full blur-3xl" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-200/20 rounded-full blur-3xl" />

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        {/* Section Header */}
        <div className="text-center mb-20">
          <Badge className="mb-6 px-4 py-2 bg-gradient-to-r from-blue-100 to-purple-100 text-blue-700 border-blue-200/50 hover:from-blue-200 hover:to-purple-200 transition-all duration-300">
            <CheckCircle className="w-4 h-4 mr-2" />
            Powerful Features
          </Badge>
          
          <h2 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-gray-900 via-blue-900 to-purple-900 bg-clip-text text-transparent mb-8 leading-tight">
            Everything you need for
            <br />
            <span className="text-blue-600">AI Fairness Analysis</span>
          </h2>
          
          <p className="text-xl text-gray-600 max-w-4xl mx-auto leading-relaxed">
            Our comprehensive suite of tools helps data scientists and ML engineers build fairer, 
            more equitable AI systems with confidence and precision.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid lg:grid-cols-3 md:grid-cols-2 gap-8">
          {features.map((feature, index) => (
            <Card 
              key={index} 
              className={`group relative overflow-hidden border-0 shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:scale-105 cursor-pointer ${
                hoveredFeature === index ? 'shadow-2xl scale-105' : ''
              }`}
              onMouseEnter={() => setHoveredFeature(index)}
              onMouseLeave={() => setHoveredFeature(null)}
            >
              {/* Gradient Overlay */}
              <div className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-500`} />
              
              <CardHeader className="text-center pb-4 relative z-10">
                {/* Icon Container */}
                <div className="relative mx-auto mb-6">
                  <div className={`w-20 h-20 ${feature.bgColor} rounded-3xl flex items-center justify-center mx-auto group-hover:scale-110 transition-transform duration-300 shadow-lg group-hover:shadow-xl`}>
                    <feature.icon className={`h-10 w-10 ${feature.iconColor}`} />
                  </div>
                  
                  {/* Floating Badge */}
                  <Badge className="absolute -top-2 -right-2 bg-white shadow-lg text-xs px-2 py-1 border-gray-200">
                    {feature.stats}
                  </Badge>
                </div>

                <CardTitle className="text-xl font-bold text-gray-900 mb-3 group-hover:text-blue-900 transition-colors">
                  {feature.title}
                </CardTitle>
              </CardHeader>
              
              <CardContent className="text-center relative z-10">
                <p className="text-gray-600 leading-relaxed mb-4">
                  {feature.description}
                </p>
                
                {/* Progress Indicator */}
                <div className="flex items-center justify-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <TrendingUp className="w-4 h-4 text-green-500" />
                  <span className="text-sm text-green-600 font-medium">Ready to use</span>
                </div>
              </CardContent>

              {/* Hover Effect Lines */}
              <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-blue-500 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </Card>
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="text-center mt-20">
          <div className="inline-flex items-center space-x-4 bg-white rounded-2xl p-6 shadow-xl">
            <div className="flex -space-x-2">
              {[1,2,3,4].map(i => (
                <div key={i} className="w-10 h-10 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full border-2 border-white flex items-center justify-center">
                  <Users className="w-5 h-5 text-white" />
                </div>
              ))}
            </div>
            <div className="text-left">
              <div className="font-semibold text-gray-900">Join 500+ ML Teams</div>
              <div className="text-sm text-gray-600">Already building fairer AI</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
