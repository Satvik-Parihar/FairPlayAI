
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Plus, Bell, Settings, User, Sparkles, Zap, Crown } from "lucide-react";

const DashboardHeader = () => {
  return (
    <div className="sticky top-16 z-40 bg-white/80 backdrop-blur-xl border-b border-gray-200/50">
      <div className="max-w-7xl mx-auto px-6 py-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          {/* Title Section */}
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <div className="relative">
                <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 via-blue-800 to-purple-800 bg-clip-text text-transparent">
                  Analytics Hub
                </h1>
                <div className="absolute -top-1 -right-8">
                  <Sparkles className="h-5 w-5 text-yellow-500 animate-pulse" />
                </div>
              </div>
              <Badge className="bg-gradient-to-r from-blue-500 to-purple-500 text-white border-0 px-3 py-1">
                <Crown className="h-3 w-3 mr-1" />
                Pro
              </Badge>
            </div>
            
            <p className="text-gray-600 text-lg max-w-2xl">
              Monitor AI fairness, detect bias patterns, and optimize your machine learning models with our advanced analytics platform.
            </p>
            
            <div className="flex items-center gap-4 mt-4">
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span>Live monitoring active</span>
              </div>
              <div className="text-sm text-gray-500">
                Last updated: 2 min ago
              </div>
            </div>
          </div>
          
          {/* Action Section */}
          <div className="flex items-center gap-4">
            {/* Quick Stats */}
            <div className="hidden lg:flex items-center gap-6 mr-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">24</div>
                <div className="text-xs text-gray-500">Active Models</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">98.2%</div>
                <div className="text-xs text-gray-500">Uptime</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">7.8</div>
                <div className="text-xs text-gray-500">Avg Score</div>
              </div>
            </div>
            
            {/* Action Buttons */}
            <Button variant="ghost" size="sm" className="relative">
              <Bell className="h-5 w-5" />
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full flex items-center justify-center">
                <span className="text-xs text-white font-bold">3</span>
              </div>
            </Button>
            
            <Button variant="ghost" size="sm">
              <Settings className="h-5 w-5" />
            </Button>
            
            <Avatar className="h-10 w-10 ring-2 ring-blue-500/20">
              <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-500 text-white font-semibold">
                AI
              </AvatarFallback>
            </Avatar>
            
            <Link to="/upload">
              <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105 group">
                <div className="absolute inset-0 bg-white/10 rounded-md opacity-0 group-hover:opacity-100 transition-opacity" />
                <Plus className="h-5 w-5 mr-2" />
                New Analysis
                <Zap className="h-4 w-4 ml-2 group-hover:rotate-12 transition-transform" />
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardHeader;
