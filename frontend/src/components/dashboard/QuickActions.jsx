
import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Upload, FileText, Brain, Settings, Download, Share, Zap, Sparkles, ArrowRight, Play } from "lucide-react";

const QuickActions = () => {
  const actions = [
    {
      title: "Upload New Dataset",
      description: "Start a new bias analysis with your CSV data and ML models",
      icon: Upload,
      gradient: "from-blue-500 to-cyan-500",
      href: "/upload",
      badge: "Most Popular",
      badgeColor: "bg-blue-100 text-blue-700"
    },
    {
      title: "Generate Report",
      description: "Create comprehensive fairness reports for stakeholders",
      icon: FileText,
      gradient: "from-green-500 to-emerald-500",
      href: "/report",
      badge: "New Feature",
      badgeColor: "bg-green-100 text-green-700"
    },
    {
      title: "AI Model Optimizer",
      description: "Let our AI suggest improvements for better fairness scores",
      icon: Brain,
      gradient: "from-purple-500 to-pink-500",
      href: "/optimize",
      badge: "AI Powered",
      badgeColor: "bg-purple-100 text-purple-700"
    },
    {
      title: "Export Analytics",
      description: "Download your bias analysis data in multiple formats",
      icon: Download,
      gradient: "from-orange-500 to-red-500",
      href: "/export",
      badge: "Pro Feature",
      badgeColor: "bg-orange-100 text-orange-700"
    }
  ];

  const templates = [
    {
      name: "Hiring Fairness Audit",
      description: "Template for recruitment bias analysis",
      icon: "👥",
      color: "bg-blue-50 border-blue-200"
    },
    {
      name: "Loan Approval Check",
      description: "Financial services fairness template",
      icon: "💰",
      color: "bg-green-50 border-green-200"
    },
    {
      name: "Healthcare AI Review",
      description: "Medical algorithm bias assessment",
      icon: "🏥",
      color: "bg-purple-50 border-purple-200"
    }
  ];

  return (
    <div className="space-y-6">
      {/* Quick Actions Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Zap className="h-6 w-6 text-yellow-500" />
            Quick Actions
          </h2>
          <p className="text-gray-600 mt-1">Fast-track your AI fairness workflow</p>
        </div>
        <Button variant="outline" className="border-gray-200 hover:bg-gray-50">
          <Settings className="h-4 w-4 mr-2" />
          Customize
        </Button>
      </div>

      {/* Action Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {actions.map((action, index) => (
          <Link key={index} to={action.href} className="group">
            <Card className="relative overflow-hidden border-0 shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:scale-105 bg-white h-full">
              {/* Gradient Background */}
              <div className={`absolute inset-0 bg-gradient-to-br ${action.gradient} opacity-5 group-hover:opacity-10 transition-opacity duration-300`} />
              
              {/* Animated Border */}
              <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-transparent via-white/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 transform -skew-x-12" />
              
              <CardContent className="p-6 relative z-10 h-full flex flex-col">
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className={`w-12 h-12 bg-gradient-to-br ${action.gradient} rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 group-hover:rotate-6 transition-transform duration-300`}>
                    <action.icon className="h-6 w-6 text-white" />
                  </div>
                  <Badge className={`${action.badgeColor} text-xs`}>
                    {action.badge}
                  </Badge>
                </div>
                
                {/* Content */}
                <div className="flex-1 space-y-3">
                  <h3 className="font-bold text-gray-900 group-hover:text-blue-900 transition-colors">
                    {action.title}
                  </h3>
                  <p className="text-sm text-gray-600 leading-relaxed">
                    {action.description}
                  </p>
                </div>
                
                {/* Action */}
                <div className="mt-4 flex items-center text-sm font-medium text-gray-500 group-hover:text-blue-600 transition-colors">
                  <span>Get Started</span>
                  <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {/* Templates Section */}
      <Card className="border-0 shadow-xl bg-gradient-to-r from-gray-50 to-blue-50 overflow-hidden">
        <CardContent className="p-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div className="space-y-2">
              <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-yellow-500" />
                Analysis Templates
              </h3>
              <p className="text-gray-600">
                Pre-configured templates for common bias analysis scenarios
              </p>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 lg:w-auto w-full">
              {templates.map((template, index) => (
                <Button 
                  key={index}
                  variant="outline" 
                  className={`${template.color} hover:bg-white/80 border h-auto p-4 flex-col gap-2 group`}
                >
                  <div className="text-2xl group-hover:scale-110 transition-transform">
                    {template.icon}
                  </div>
                  <div className="text-center">
                    <div className="font-medium text-sm">{template.name}</div>
                    <div className="text-xs text-gray-500">{template.description}</div>
                  </div>
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default QuickActions;
