
import { useState, useEffect } from "react";
import { TrendingUp, Users, Zap, Shield, CheckCircle, Star } from "lucide-react";

const StatsSection = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [counters, setCounters] = useState({
    models: 0,
    companies: 0,
    accuracy: 0,
    reports: 0
  });

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          // Animate counters
          const targets = { models: 50000, companies: 500, accuracy: 99.2, reports: 125000 };
          const duration = 2000;
          const steps = 60;
          const stepDuration = duration / steps;
          
          let step = 0;
          const timer = setInterval(() => {
            step++;
            const progress = step / steps;
            setCounters({
              models: Math.floor(targets.models * progress),
              companies: Math.floor(targets.companies * progress),
              accuracy: Math.min(targets.accuracy, targets.accuracy * progress),
              reports: Math.floor(targets.reports * progress)
            });
            
            if (step >= steps) clearInterval(timer);
          }, stepDuration);
        }
      },
      { threshold: 0.5 }
    );

    const element = document.getElementById('stats-section');
    if (element) observer.observe(element);

    return () => observer.disconnect();
  }, []);

  const stats = [
    {
      icon: Zap,
      value: `${counters.models.toLocaleString()}+`,
      label: "ML Models Analyzed",
      sublabel: "Across all industries",
      gradient: "from-blue-500 to-cyan-500",
      iconBg: "bg-blue-100",
      iconColor: "text-blue-600"
    },
    {
      icon: Users,
      value: `${counters.companies}+`,
      label: "Companies Trust Us",
      sublabel: "From startups to Fortune 500",
      gradient: "from-purple-500 to-pink-500",
      iconBg: "bg-purple-100",
      iconColor: "text-purple-600"
    },
    {
      icon: Shield,
      value: `${counters.accuracy.toFixed(1)}%`,
      label: "Bias Detection Rate",
      sublabel: "Industry-leading accuracy",
      gradient: "from-green-500 to-emerald-500",
      iconBg: "bg-green-100",
      iconColor: "text-green-600"
    },
    {
      icon: CheckCircle,
      value: `${counters.reports.toLocaleString()}+`,
      label: "Reports Generated",
      sublabel: "Comprehensive analysis delivered",
      gradient: "from-orange-500 to-red-500",
      iconBg: "bg-orange-100",
      iconColor: "text-orange-600"
    }
  ];

  return (
    <section 
      id="stats-section"
      className="py-24 bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 relative overflow-hidden"
    >
      {/* Background Effects */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_40%,rgba(59,130,246,0.15),transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_60%,rgba(147,51,234,0.15),transparent_50%)]" />
      </div>

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 mb-6">
            <Star className="w-4 h-4 text-yellow-400" />
            <span className="text-white font-medium">Trusted Globally</span>
          </div>
          
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
            The Numbers Speak for Themselves
          </h2>
          <p className="text-xl text-blue-200 max-w-2xl mx-auto">
            Join the leading platform for AI fairness and bias detection
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {stats.map((stat, index) => (
            <div 
              key={index}
              className={`group relative bg-white/10 backdrop-blur-sm rounded-3xl p-8 border border-white/20 hover:bg-white/15 transition-all duration-500 transform ${
                isVisible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
              }`}
              style={{ transitionDelay: `${index * 150}ms` }}
            >
              {/* Gradient Border Effect */}
              <div className={`absolute inset-0 rounded-3xl bg-gradient-to-br ${stat.gradient} opacity-0 group-hover:opacity-20 transition-opacity duration-300`} />
              
              {/* Icon */}
              <div className={`w-16 h-16 ${stat.iconBg} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                <stat.icon className={`w-8 h-8 ${stat.iconColor}`} />
              </div>

              {/* Content */}
              <div className="relative z-10">
                <div className="text-4xl md:text-5xl font-bold text-white mb-2 font-mono">
                  {stat.value}
                </div>
                <div className="text-lg font-semibold text-blue-100 mb-1">
                  {stat.label}
                </div>
                <div className="text-sm text-blue-300">
                  {stat.sublabel}
                </div>
              </div>

              {/* Trend Indicator */}
              <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <TrendingUp className="w-5 h-5 text-green-400" />
              </div>

              {/* Bottom Glow */}
              <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-24 h-1 bg-gradient-to-r from-transparent via-white/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </div>
          ))}
        </div>

        {/* Bottom Section */}
        <div className="text-center mt-16">
          <div className="inline-flex items-center gap-6 bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse" />
              <span className="text-white font-medium">Live Analytics</span>
            </div>
            <div className="text-blue-200">
              <span className="font-mono text-lg">+{Math.floor(Math.random() * 50) + 10}</span> models analyzed today
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default StatsSection;
