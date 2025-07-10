
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

      {/* Testimonials */}
      <section className="py-32 bg-gradient-to-br from-gray-50 to-blue-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-20">
            <Badge className="mb-6 px-4 py-2 bg-gradient-to-r from-yellow-100 to-orange-100 text-orange-700 border-orange-200/50">
              <Star className="w-4 h-4 mr-2" />
              Customer Love
            </Badge>
            <h2 className="text-5xl font-bold text-gray-900 mb-8">
              What Our Users Say
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Join hundreds of ML teams building fairer AI systems
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="relative overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
                <CardContent className="p-8">
                  <div className="flex items-center mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                    ))}
                  </div>
                  
                  <Quote className="w-8 h-8 text-blue-200 mb-4" />
                  <p className="text-gray-700 leading-relaxed mb-6 italic">
                    "{testimonial.quote}"
                  </p>
                  
                  <div className="flex items-center">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold mr-4">
                      {testimonial.avatar}
                    </div>
                    <div>
                      <div className="font-semibold text-gray-900">{testimonial.author}</div>
                      <div className="text-sm text-gray-600">{testimonial.role}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-32 bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(59,130,246,0.1),transparent_70%)]" />
        
        <div className="max-w-4xl mx-auto text-center px-6 relative z-10">
          <h2 className="text-5xl md:text-6xl font-bold text-white mb-8 leading-tight">
            Ready to Build
            <br />
            <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              Fairer AI?
            </span>
          </h2>
          <p className="text-xl text-gray-300 mb-12 leading-relaxed max-w-2xl mx-auto">
            Join thousands of data scientists and ML engineers who trust FairPlayAI 
            to detect and mitigate bias in their machine learning models.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
            <Link to="/upload">
              <Button size="lg" className="group relative overflow-hidden bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-12 py-6 text-lg font-semibold shadow-2xl hover:shadow-blue-500/25 transition-all duration-300 transform hover:scale-105 border-0">
                <div className="absolute inset-0 bg-white/10 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
                <Upload className="mr-3 h-6 w-6" />
                Start Free Analysis
                <ArrowRight className="ml-3 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
            <Link to="/dashboard">
              <Button variant="outline" size="lg" className="border-2 border-gray-300/50 text-gray-300 hover:bg-white/10 hover:border-white/50 hover:text-white px-12 py-6 text-lg font-semibold backdrop-blur-sm transition-all duration-300">
                View Sample Report
              </Button>
            </Link>
          </div>
          
          <div className="mt-12 text-gray-400 text-sm">
            No credit card required • Start analyzing in 2 minutes • SOC2 compliant
          </div>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;
