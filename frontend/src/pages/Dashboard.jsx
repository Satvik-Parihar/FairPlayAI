
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Search, Bell, Settings, User, ChevronDown, Filter, SortDesc, Layout, BarChart3, TrendingUp, Zap, Shield, Brain, Activity } from "lucide-react";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import AnalyticsOverview from "@/components/dashboard/AnalyticsOverview";
import RecentAnalyses from "@/components/dashboard/RecentAnalyses";
import InsightsCarousel from "@/components/dashboard/InsightsCarousel";
import QuickActions from "@/components/dashboard/QuickActions";

const Dashboard = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [viewMode, setViewMode] = useState("grid");

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/50">
      {/* Modern Background Pattern */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(59,130,246,0.05),transparent_50%)] pointer-events-none" />
      <div className="absolute inset-0 bg-grid-slate-100 [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.6))] pointer-events-none" />
      
      <div className="relative z-10">
        {/* Header */}
        <DashboardHeader />
        
        <div className="max-w-7xl mx-auto px-6 py-8 space-y-8">
          {/* Analytics Overview */}
          <AnalyticsOverview />
          
          {/* Insights Carousel */}
          <InsightsCarousel />
          
          {/* Quick Actions */}
          <QuickActions />
          
          {/* Filters and Search */}
          <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-xl">
            <CardContent className="p-6">
              <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
                <div className="flex flex-col sm:flex-row gap-4 flex-1">
                  <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      placeholder="Search analyses, datasets, or models..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10 border-gray-200/60 bg-white/50 backdrop-blur-sm focus:bg-white focus:border-blue-300"
                    />
                  </div>
                  
                  <div className="flex gap-3">
                    <Select value={filterStatus} onValueChange={setFilterStatus}>
                      <SelectTrigger className="w-[140px] border-gray-200/60 bg-white/50 backdrop-blur-sm">
                        <Filter className="h-4 w-4 mr-2" />
                        <SelectValue placeholder="Status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Status</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                        <SelectItem value="processing">Processing</SelectItem>
                        <SelectItem value="failed">Failed</SelectItem>
                      </SelectContent>
                    </Select>
                    
                    <Button variant="outline" size="sm" className="border-gray-200/60 bg-white/50 backdrop-blur-sm hover:bg-white">
                      <SortDesc className="h-4 w-4 mr-2" />
                      Sort
                    </Button>
                  </div>
                </div>
                
                <div className="flex gap-2">
                  <Button
                    variant={viewMode === "grid" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setViewMode("grid")}
                    className="h-9 w-9 p-0"
                  >
                    <Layout className="h-4 w-4" />
                  </Button>
                  <Button
                    variant={viewMode === "list" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setViewMode("list")}
                    className="h-9 w-9 p-0"
                  >
                    <BarChart3 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* Recent Analyses */}
          <RecentAnalyses 
            searchQuery={searchQuery}
            filterStatus={filterStatus}
            viewMode={viewMode}
          />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
