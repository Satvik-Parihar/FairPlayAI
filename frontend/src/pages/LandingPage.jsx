
import HeroSection from "../components/sections/HeroSection";
import FeaturesSection from "../components/sections/FeaturesSection";
import StatsSection from "../components/sections/StatsSection";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Upload, FileText, Brain, CheckCircle, Star, Quote } from "lucide-react";

const LandingPage = () => {
  const steps = [
    {
      number: "01",
      title: "Upload Your Data",
      description: "Drag and drop your CSV dataset and optional ML model (.pkl) using our secure, encrypted platform",
      icon: Upload,
      gradient: "from-blue-500 to-cyan-500"
    },
    {
      number: "02", 
      title: "AI Analysis",
      description: "Our advanced neural networks analyze your data for bias across multiple sensitive attributes in real-time",
      icon: Brain,
      gradient: "from-purple-500 to-pink-500"
    },
    {
      number: "03",
      title: "Actionable Insights",
      description: "Get detailed fairness metrics, interactive visualizations, and specific recommendations for improvement",
      icon: FileText,
      gradient: "from-green-500 to-emerald-500"
    }
  ];

  const testimonials = [
    {
      quote: "FairPlayAI helped us identify and fix critical bias issues in our hiring algorithm. Essential tool for any ML team.",
      author: "Sarah Chen",
      role: "Head of ML, TechCorp",
      avatar: "SC",
      rating: 5
    },
    {
      quote: "The depth of analysis and actionable recommendations are incredible. Saved us months of manual bias testing.",
      author: "Marcus Johnson", 
      role: "Data Scientist, FinanceAI",
      avatar: "MJ",
      rating: 5
    },
    {
      quote: "Finally, a tool that makes AI fairness accessible. The visualizations help explain complex concepts to stakeholders.",
      author: "Dr. Priya Patel",
      role: "AI Ethics Lead, HealthTech",
      avatar: "PP",
      rating: 5
    }
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <HeroSection />

      {/* Features Section */}
      <FeaturesSection />

      {/* How It Works */}
      <section className="py-32 bg-white relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 via-transparent to-purple-50/50" />
        
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="text-center mb-20">
            <Badge className="mb-6 px-4 py-2 bg-gradient-to-r from-purple-100 to-pink-100 text-purple-700 border-purple-200/50">
              <CheckCircle className="w-4 h-4 mr-2" />
              Simple Process
            </Badge>
            <h2 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-gray-900 to-purple-900 bg-clip-text text-transparent mb-8">
              From Upload to Insights
              <br />
              <span className="text-purple-600">in 3 Simple Steps</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Get comprehensive bias analysis and fairness metrics faster than ever before
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-12 relative">
            {/* Connection Lines */}
            <div className="hidden md:block absolute top-24 left-1/3 right-1/3 h-0.5 bg-gradient-to-r from-blue-200 via-purple-200 to-green-200" />
            
            {steps.map((step, index) => (
              <div key={index} className="relative group">
                {/* Step Card */}
                <Card className="relative overflow-hidden border-0 shadow-xl hover:shadow-2xl transition-all duration-500 transform hover:scale-105 bg-white">
                  <div className={`absolute inset-0 bg-gradient-to-br ${step.gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-300`} />
                  
                  <CardHeader className="text-center relative z-10">
                    {/* Step Number */}
                    <div className="relative mx-auto mb-6">
                      <div className={`w-24 h-24 bg-gradient-to-br ${step.gradient} rounded-3xl flex items-center justify-center mx-auto shadow-2xl group-hover:scale-110 transition-transform duration-300`}>
                        <step.icon className="h-12 w-12 text-white" />
                      </div>
                      <div className="absolute -top-3 -right-3 w-10 h-10 bg-white rounded-full shadow-lg flex items-center justify-center border-2 border-gray-100">
                        <span className="text-sm font-bold text-gray-700">{step.number}</span>
                      </div>
                    </div>
                    
                    <CardTitle className="text-2xl font-bold text-gray-900 mb-4 group-hover:text-purple-900 transition-colors">
                      {step.title}
                    </CardTitle>
                  </CardHeader>
                  
                  <CardContent className="text-center pb-8 relative z-10">
                    <CardDescription className="text-gray-600 leading-relaxed text-base">
                      {step.description}
                    </CardDescription>
                  </CardContent>
                </Card>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <StatsSection />

      

     
    </div>
  );
};

export default LandingPage;
