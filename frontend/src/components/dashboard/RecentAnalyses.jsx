
import { useState } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Eye, Download, MoreVertical, FileText, Calendar, Clock, TrendingUp, AlertTriangle, CheckCircle, Play, Pause } from "lucide-react";

const RecentAnalyses = ({ searchQuery, filterStatus, viewMode }) => {
  // Mock data - would come from API
  const analysisHistory = [
    {
      id: "report-001",
      name: "Employee Hiring Fairness Audit",
      dataset: "hiring_data_2024.csv",
      upload_date: "2024-01-15",
      status: "completed",
      fairness_score: 7.2,
      bias_detected: ["gender", "age"],
      model_included: true,
      risk_level: "medium",
      author: "Sarah Chen",
      processing_time: "2m 34s",
      records: "15,240",
      image: "https://images.unsplash.com/photo-1573164713714-d95e436ab8d6?w=80&h=80&fit=crop"
    },
    {
      id: "report-002", 
      name: "Loan Approval Algorithm Review",
      dataset: "loan_applications.csv",
      upload_date: "2024-01-12",
      status: "completed",
      fairness_score: 8.5,
      bias_detected: ["income_level"],
      model_included: true,
      risk_level: "low",
      author: "Marcus Johnson",
      processing_time: "1m 52s",
      records: "8,945",
      image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=80&h=80&fit=crop"
    },
    {
      id: "report-003",
      name: "University Admissions Analysis",
      dataset: "admissions_data.csv", 
      upload_date: "2024-01-10",
      status: "processing",
      fairness_score: null,
      bias_detected: [],
      model_included: false,
      risk_level: null,
      author: "Dr. Priya Patel",
      processing_time: null,
      records: "12,658",
      image: "https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?w=80&h=80&fit=crop"
    },
    {
      id: "report-004",
      name: "Healthcare Risk Prediction Model",
      dataset: "patient_data.csv",
      upload_date: "2024-01-08",
      status: "completed",
      fairness_score: 6.1,
      bias_detected: ["age", "gender", "race"],
      model_included: true,
      risk_level: "high",
      author: "Alex Rivera",
      processing_time: "4m 18s",
      records: "23,456",
      image: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=80&h=80&fit=crop"
    }
  ];

  const getStatusConfig = (status) => {
    switch(status) {
      case "completed":
        return { 
          variant: "default", 
          color: "bg-green-100 text-green-700",
          icon: CheckCircle
        };
      case "processing":
        return { 
          variant: "secondary", 
          color: "bg-blue-100 text-blue-700",
          icon: Play
        };
      case "failed":
        return { 
          variant: "destructive", 
          color: "bg-red-100 text-red-700",
          icon: AlertTriangle
        };
      default:
        return { 
          variant: "outline", 
          color: "bg-gray-100 text-gray-700",
          icon: Pause
        };
    }
  };

  const getScoreColor = (score) => {
    if (!score) return "text-gray-400";
    if (score >= 8) return "text-green-600";
    if (score >= 6) return "text-yellow-600";
    return "text-red-600";
  };

  const getRiskColor = (risk) => {
    switch(risk) {
      case "low": return "bg-green-100 text-green-700 border-green-200";
      case "medium": return "bg-yellow-100 text-yellow-700 border-yellow-200";
      case "high": return "bg-red-100 text-red-700 border-red-200";
      default: return "bg-gray-100 text-gray-700 border-gray-200";
    }
  };

  const filteredAnalyses = analysisHistory.filter(analysis => {
    const matchesSearch = analysis.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         analysis.dataset.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filterStatus === "all" || analysis.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  if (filteredAnalyses.length === 0) {
    return (
      <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-xl">
        <CardContent className="p-16 text-center">
          <div className="w-20 h-20 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <FileText className="h-10 w-10 text-gray-400" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-3">No analyses found</h3>
          <p className="text-gray-500 mb-8 max-w-md mx-auto">
            {searchQuery || filterStatus !== "all" 
              ? "Try adjusting your search or filter criteria"
              : "Upload your first dataset to get started with bias analysis"
            }
          </p>
          <Link to="/upload">
            <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white">
              Start New Analysis
            </Button>
          </Link>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-xl">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-xl flex items-center gap-2">
              <FileText className="h-5 w-5 text-blue-600" />
              Recent Analyses
            </CardTitle>
            <CardDescription className="mt-1">
              Your latest bias analysis reports and insights
            </CardDescription>
          </div>
          <Badge className="bg-gradient-to-r from-blue-500 to-purple-500 text-white border-0">
            {filteredAnalyses.length} Results
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="p-0">
        <div className="divide-y divide-gray-100">
          {filteredAnalyses.map((analysis) => {
            const statusConfig = getStatusConfig(analysis.status);
            
            return (
              <div key={analysis.id} className="p-6 hover:bg-gray-50/80 transition-all duration-300 group">
                <div className="flex items-start gap-4">
                  {/* Analysis Image/Icon */}
                  <div className="relative flex-shrink-0">
                    <img 
                      src={analysis.image} 
                      alt={analysis.name}
                      className="w-16 h-16 rounded-xl object-cover shadow-md group-hover:shadow-lg transition-shadow"
                    />
                    <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-white rounded-full shadow-lg flex items-center justify-center">
                      <statusConfig.icon className="h-3 w-3 text-gray-600" />
                    </div>
                  </div>

                  {/* Main Content */}
                  <div className="flex-1 min-w-0">
                    {/* Header */}
                    <div className="flex items-start justify-between mb-3">
                      <div className="space-y-1">
                        <h3 className="font-bold text-gray-900 group-hover:text-blue-600 transition-colors text-lg">
                          {analysis.name}
                        </h3>
                        <div className="flex items-center gap-3 text-sm text-gray-500">
                          <span className="flex items-center gap-1">
                            <FileText className="h-3 w-3" />
                            {analysis.dataset}
                          </span>
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {analysis.upload_date}
                          </span>
                          <span className="flex items-center gap-1">
                            <span className="text-gray-400">•</span>
                            {analysis.records} records
                          </span>
                        </div>
                      </div>
                      
                      {/* Status and Actions */}
                      <div className="flex items-center gap-2">
                        <Badge className={statusConfig.color}>
                          {analysis.status}
                        </Badge>
                        <Button variant="ghost" size="sm">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    {/* Metrics */}
                    <div className="flex flex-wrap items-center gap-6 mb-4">
                      {analysis.fairness_score && (
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-gray-500">Fairness Score:</span>
                          <span className={`font-bold text-lg ${getScoreColor(analysis.fairness_score)}`}>
                            {analysis.fairness_score}/10
                          </span>
                        </div>
                      )}
                      
                      {analysis.processing_time && (
                        <div className="flex items-center gap-1 text-sm text-gray-500">
                          <Clock className="h-3 w-3" />
                          {analysis.processing_time}
                        </div>
                      )}
                      
                      {analysis.risk_level && (
                        <Badge className={getRiskColor(analysis.risk_level)}>
                          {analysis.risk_level} risk
                        </Badge>
                      )}
                      
                      {analysis.model_included && (
                        <Badge variant="outline" className="border-purple-200 text-purple-600">
                          Model Included
                        </Badge>
                      )}
                    </div>

                    {/* Bias Detection */}
                    {analysis.bias_detected.length > 0 && (
                      <div className="flex items-center gap-2 mb-4">
                        <span className="text-sm text-gray-500">Bias Detected:</span>
                        <div className="flex gap-1">
                          {analysis.bias_detected.map((attr, idx) => (
                            <Badge key={idx} className="bg-red-50 text-red-700 border-red-200 text-xs">
                              {attr}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Author and Actions */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Avatar className="h-6 w-6">
                          <AvatarFallback className="text-xs bg-gradient-to-br from-blue-500 to-purple-500 text-white">
                            {analysis.author.split(' ').map(n => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                        <span className="text-sm text-gray-600">by {analysis.author}</span>
                      </div>
                      
                      <div className="flex gap-2">
                        {analysis.status === "completed" ? (
                          <>
                            <Link to={`/report/${analysis.id}`}>
                              <Button variant="outline" size="sm" className="hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200">
                                <Eye className="h-4 w-4 mr-1" />
                                View
                              </Button>
                            </Link>
                            <Button variant="outline" size="sm" className="hover:bg-green-50 hover:text-green-600 hover:border-green-200">
                              <Download className="h-4 w-4 mr-1" />
                              Export
                            </Button>
                          </>
                        ) : (
                          <div className="flex items-center gap-2 text-blue-600">
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                            <span className="text-sm font-medium">Processing...</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};

export default RecentAnalyses;
