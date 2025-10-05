import { TrendingUp, TrendingDown, Sparkles } from "lucide-react";
import { Button } from "../ui/button";
import { Card } from "../ui/card";
import { Badge } from "../ui/badge";
import { Header } from "../Header";
import { Progress } from "../ui/progress";

interface StatsDashboardScreenProps {
  onViewDetails: () => void;
  onBack: () => void;
}

const categoryStats = [
  { name: "Tops", count: 12, percentage: 35, color: "bg-blue-500" },
  { name: "Bottoms", count: 8, percentage: 23, color: "bg-green-500" },
  { name: "Shoes", count: 6, percentage: 18, color: "bg-purple-500" },
  { name: "Outerwear", count: 5, percentage: 15, color: "bg-orange-500" },
  { name: "Accessories", count: 3, percentage: 9, color: "bg-pink-500" }
];

const quickStats = [
  { label: "Total Items", value: "34", icon: TrendingUp, color: "text-blue-600" },
  { label: "Most Worn Category", value: "Tops", icon: TrendingUp, color: "text-green-600" },
  { label: "Average Cost Per Wear", value: "$12.50", icon: TrendingDown, color: "text-purple-600" },
  { label: "Items Not Worn", value: "7", icon: TrendingDown, color: "text-orange-600" }
];

const insights = [
  {
    title: "Great Investment",
    description: "Your white Oxford shirt has been worn 23 times this year - that's $2.17 per wear!",
    type: "positive"
  },
  {
    title: "Wardrobe Gap",
    description: "You might benefit from 1-2 more casual weekend tops to rotate with your favorites.",
    type: "suggestion"
  },
  {
    title: "Seasonal Reminder",
    description: "Winter is coming - time to bring out your wool sweaters and coats!",
    type: "seasonal"
  }
];

export function StatsDashboardScreen({ onViewDetails, onBack }: StatsDashboardScreenProps) {
  return (
    <div className="min-h-screen bg-background">
      {/* Status Bar */}
      <div className="flex justify-between items-center px-4 pt-3 pb-6">
        <div className="flex gap-1">
          <div className="w-1 h-1 bg-foreground rounded-full"></div>
          <div className="w-1 h-1 bg-foreground rounded-full"></div>
          <div className="w-1 h-1 bg-foreground rounded-full"></div>
          <div className="w-1 h-1 bg-foreground rounded-full"></div>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-4 h-2 border border-foreground rounded-sm">
            <div className="w-3 h-1 bg-foreground rounded-sm m-0.5"></div>
          </div>
          <Sparkles className="w-4 h-4" />
          <div className="w-6 h-3 border border-foreground rounded">
            <div className="w-4 h-1 bg-foreground rounded m-0.5"></div>
          </div>
        </div>
      </div>

      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-brand text-2xl text-primary mb-2">STATYSTYKI SZAFY</h1>
        <p className="text-muted-foreground">Analiza Twojego stylu</p>
      </div>
      
      <div className="p-6 space-y-6">
        {/* Quick Stats Grid */}
        <div className="grid grid-cols-2 gap-4">
          {quickStats.map((stat, index) => {
            const IconComponent = stat.icon;
            return (
              <Card key={index} className="p-4">
                <div className="flex items-center gap-3">
                  <IconComponent className={`w-5 h-5 ${stat.color}`} />
                  <div>
                    <p className="text-xs text-muted-foreground">{stat.label}</p>
                    <p className="text-lg">{stat.value}</p>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>

        {/* Category Breakdown */}
        <Card className="p-6">
          <h3 className="text-lg mb-4">Wardrobe Breakdown</h3>
          <div className="space-y-4">
            {categoryStats.map((category, index) => (
              <div key={index} className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm">{category.name}</span>
                  <span className="text-sm text-muted-foreground">
                    {category.count} items ({category.percentage}%)
                  </span>
                </div>
                <Progress value={category.percentage} className="h-2" />
              </div>
            ))}
          </div>
        </Card>

        {/* AI Insights */}
        <Card className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <Sparkles className="w-5 h-5 text-blue-600" />
            <h3 className="text-lg">AI Insights</h3>
          </div>
          <div className="space-y-3">
            {insights.map((insight, index) => (
              <div key={index} className={`p-3 rounded-lg ${
                insight.type === 'positive' ? 'bg-green-50 border-l-4 border-green-500' :
                insight.type === 'suggestion' ? 'bg-blue-50 border-l-4 border-blue-500' :
                'bg-orange-50 border-l-4 border-orange-500'
              }`}>
                <h4 className="text-sm mb-1">{insight.title}</h4>
                <p className="text-xs text-muted-foreground">{insight.description}</p>
              </div>
            ))}
          </div>
        </Card>

        {/* View Detailed Stats */}
        <Button 
          onClick={onViewDetails}
          className="w-full"
          variant="outline"
        >
          View Hits and Misses
        </Button>
      </div>
    </div>
  );
}