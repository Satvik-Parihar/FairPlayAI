
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Lightbulb, ArrowRight } from "lucide-react";

const SuggestionBox = ({ suggestions }) => {
  const getPriorityVariant = (priority) => {
    switch(priority) {
      case "high": return "destructive";
      case "medium": return "secondary";
      case "low": return "outline";
      default: return "outline";
    }
  };

  const getSuggestionIcon = (type) => {
    switch(type) {
      case "data_augmentation": return "📊";
      case "algorithmic_adjustment": return "⚙️";
      case "feature_engineering": return "🔧";
      default: return "💡";
    }
  };

  const getSuggestionTitle = (type) => {
    switch(type) {
      case "data_augmentation": return "Data Augmentation";
      case "algorithmic_adjustment": return "Algorithmic Adjustment";
      case "feature_engineering": return "Feature Engineering";
      default: return "General Improvement";
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Lightbulb className="h-5 w-5 text-yellow-500" />
          <span>Bias Mitigation Suggestions</span>
        </CardTitle>
        <CardDescription>
          Actionable recommendations to improve your model's fairness
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {suggestions.map((suggestion, index) => (
            <div key={index} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center space-x-3">
                  <span className="text-2xl">{getSuggestionIcon(suggestion.type)}</span>
                  <div>
                    <h4 className="font-semibold text-gray-900">
                      {getSuggestionTitle(suggestion.type)}
                    </h4>
                    <Badge variant={getPriorityVariant(suggestion.priority)} className="text-xs mt-1">
                      {suggestion.priority} priority
                    </Badge>
                  </div>
                </div>
              </div>
              <p className="text-gray-600 mb-3 leading-relaxed">
                {suggestion.description}
              </p>
              <Button variant="outline" size="sm" className="flex items-center space-x-1">
                <span>Learn More</span>
                <ArrowRight className="h-3 w-3" />
              </Button>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default SuggestionBox;
