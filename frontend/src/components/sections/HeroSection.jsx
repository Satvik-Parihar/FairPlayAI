
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Upload, Play, ArrowRight, Sparkles, Zap, Shield } from "lucide-react";

const HeroSection = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900">
      {/* Animated Background */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(59,130,246,0.1),transparent_70%)]" />
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-1/3 right-1/4 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
          <div className="absolute top-1/2 right-1/3 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
        </div>
      </div>

      <div className={`relative z-10 max-w-7xl mx-auto px-6 text-center transition-all duration-1000 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`}>
        {/* Launch Badge */}
        <div className={`inline-flex items-center gap-2 mb-8 transition-all duration-700 delay-300 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`}>
          <Badge className="px-4 py-2 bg-gradient-to-r from-blue-500/20 to-purple-500/20 text-blue-200 border-blue-400/30 hover:from-blue-500/30 hover:to-purple-500/30 transition-all duration-300 backdrop-blur-sm">
            <Sparkles className="w-4 h-4 mr-2" />
            Now in Beta • AI-Powered Fairness Analysis
          </Badge>
        </div>

        {/* Main Headline */}
        <h1 className={`text-6xl md:text-8xl font-black text-white mb-8 leading-tight transition-all duration-700 delay-500 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`}>
          <span className="bg-gradient-to-r from-white via-blue-200 to-purple-200 bg-clip-text text-transparent">
            FairPlay
          </span>
          <span className="text-blue-400">AI</span>
          <div className="text-2xl md:text-4xl font-normal text-blue-100 mt-6 leading-relaxed">
            Eliminate AI Bias. Build Fairer Models.
          </div>
        </h1>

        {/* Subheadline */}
        <p className={`text-xl md:text-2xl text-gray-300 mb-12 max-w-4xl mx-auto leading-relaxed transition-all duration-700 delay-700 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`}>
          Upload your ML models and datasets to detect bias across sensitive features. 
          Get comprehensive fairness metrics and actionable AI recommendations in minutes.
        </p>

        {/* CTA Buttons */}
        <div className={`flex flex-col sm:flex-row gap-6 justify-center items-center mb-16 transition-all duration-700 delay-900 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`}>
          <Link to="/login">
            <Button size="lg" className="group relative overflow-hidden bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-10 py-6 text-lg font-semibold shadow-2xl hover:shadow-blue-500/25 transition-all duration-300 transform hover:scale-105 border-0">
              <div className="absolute inset-0 bg-white/10 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
              <Upload className="mr-3 h-6 w-6" />
              Start Free Analysis
              <ArrowRight className="ml-3 h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>
          
        </div>

        {/* Social Proof Stats */}
        <div className={`grid grid-cols-2 md:grid-cols-4 gap-8 text-center transition-all duration-700 delay-1100 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`}>
          {[
            { value: "50K+", label: "Models Analyzed", icon: Zap },
            { value: "99.2%", label: "Accuracy Rate", icon: Shield },
            { value: "< 3min", label: "Avg Analysis", icon: Upload },
            { value: "500+", label: "Teams Trust Us", icon: Sparkles }
          ].map((stat, index) => (
            <div key={index} className="group">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-white/10 rounded-2xl mb-4 group-hover:bg-white/20 transition-colors backdrop-blur-sm">
                <stat.icon className="w-6 h-6 text-blue-400" />
              </div>
              <div className="text-3xl font-bold text-white mb-2">{stat.value}</div>
              <div className="text-sm text-gray-400">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
        <div className="w-6 h-10 border-2 border-white/30 rounded-full flex justify-center">
          <div className="w-1 h-3 bg-white/50 rounded-full mt-2 animate-pulse" />
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
