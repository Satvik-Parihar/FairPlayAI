
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Lightbulb, ArrowRight } from "lucide-react";

const SuggestionBox = ({ suggestions }) => {

  // Support both old and new suggestion formats
  const getPriorityVariant = (priority) => {
    switch(priority) {
      case "high": return "destructive";
      case "medium": return "secondary";
      case "low": return "outline";
      default: return "outline";
    }
  };

  const getSuggestionIcon = (severity) => {
    switch(severity) {
      case "high": return "⚠️";
      case "medium": return "⚙️";
      case "low": return "✅";
      default: return "💡";
    }
  };

  const getSuggestionTitle = (attribute) => {
    return attribute ? `Attribute: ${attribute}` : "General Suggestion";
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
          {suggestions.map((suggestion, index) => {
            // Support both old and new formats
            const attribute = suggestion.attribute || suggestion.type || null;
            const severity = suggestion.severity || suggestion.priority || "low";
            const recommendation = suggestion.recommendation || suggestion.description || "No recommendation provided.";
            return (
              <div key={index} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <span className="text-2xl">{getSuggestionIcon(severity)}</span>
                    <div>
                      <h4 className="font-semibold text-gray-900">
                        {getSuggestionTitle(attribute)}
                      </h4>
                      <Badge variant={getPriorityVariant(severity)} className="text-xs mt-1">
                        {severity} priority
                      </Badge>
                    </div>
                  </div>
                </div>
                <p className="text-gray-600 mb-3 leading-relaxed">
                  {recommendation}
                </p>
                {/* <Button variant="outline" size="sm" className="flex items-center space-x-1">
                  <span>Learn More</span>
                  <ArrowRight className="h-3 w-3" />
                </Button> */}
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};

export default SuggestionBox;
