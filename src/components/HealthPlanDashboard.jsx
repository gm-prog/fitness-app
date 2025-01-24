import React, { useState } from 'react';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle, 
  CardDescription 
} from "./ui/card";
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from "./ui/tabs";
import { Badge } from "./ui/badge";
import { 
  Activity, 
  Utensils, 
  Bed, 
  BarChart, 
  Heart, 
  CheckCircle,
  AlertCircle
} from "lucide-react";
import { Button } from "./ui/button";
import { ScrollArea } from "./ui/scroll-area";
import { Separator } from "./ui/separator";

const parseHealthPlanSections = (response) => {
    // Early return if response is not a string or is empty
    if (!response || typeof response !== 'string') {
      return [
        {
          title: "Error",
          icon: <AlertCircle className="w-6 h-6 text-red-500" />,
          content: "Unable to parse the health plan. Please try again or contact support."
        }
      ];
    }
  
    const sectionTitles = [
      "Introduction", 
      "Dietary Plan", 
      "Exercise Plan", 
      "Sleep and Recovery", 
      "Monitoring and Follow-Up"
    ];
  
    // Fallback parsing method
    const sections = sectionTitles.map((title) => {
      const regex = new RegExp(`\\*\\*${title}\\*\\*(.*?)(?=\\*\\*[A-Z]|$)`, 's');
      const match = response.match(regex);
      
      return {
        title,
        icon: getIconForSection(title),
        content: match ? match[1].trim() : `No ${title} information available.`
      };
    });
  
    // If no sections found, return a default error section
    return sections.length > 0 ? sections : [
      {
        title: "Error",
        icon: <AlertCircle className="w-6 h-6 text-red-500" />,
        content: "Unable to parse the health plan. The response format may be incorrect."
      }
    ];
  };

const getIconForSection = (title) => {
  const iconMap = {
    "Introduction": <Heart className="w-6 h-6 text-primary" />,
    "Dietary Plan": <Utensils className="w-6 h-6 text-primary" />,
    "Exercise Plan": <Activity className="w-6 h-6 text-primary" />,
    "Sleep and Recovery": <Bed className="w-6 h-6 text-primary" />,
    "Monitoring and Follow-Up": <BarChart className="w-6 h-6 text-primary" />
  };
  return iconMap[title] || <CheckCircle className="w-6 h-6 text-primary" />;
};



const HealthPlanDashboard = ({ response, userProfile }) => {

    const ProfileSummary = userProfile && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Profile Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <strong>Name:</strong> {userProfile.name}
                <br />
                <strong>Age:</strong> {userProfile.age}
                <br />
                <strong>Gender:</strong> {userProfile.gender}
              </div>
              <div>
                <strong>Fitness Goal:</strong> {userProfile.fitnessGoal}
                <br />
                <strong>Height:</strong> {userProfile.height} cm
                <br />
                <strong>Weight:</strong> {userProfile.weight} kg
              </div>
            </div>
          </CardContent>
        </Card>
      );
  const [activeTab, setActiveTab] = useState("introduction");
  if (!response) {
    return (
      <Card className="w-full max-w-4xl mx-auto p-4">
        <CardContent className="text-center">
          <AlertCircle className="mx-auto mb-4 h-12 w-12 text-red-500" />
          <p className="text-xl text-muted-foreground">
            No health plan response received. Please try submitting the form again.
          </p>
        </CardContent>
      </Card>
    );
  }

  const sections = parseHealthPlanSections(response);


  return (
    <div className="w-full max-w-4xl mx-auto p-4 space-y-6">
        {ProfileSummary}
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="text-3xl font-bold text-primary flex items-center justify-between">
            <span>Personalized Health Plan</span>
            <Badge variant="outline" className="text-sm">
              <AlertCircle className="mr-2 h-4 w-4" /> Professional Guidance Recommended
            </Badge>
          </CardTitle>
          <CardDescription>
            A comprehensive, data-driven approach to your health and wellness journey
          </CardDescription>
        </CardHeader>
      </Card>

      <Tabs 
        value={activeTab} 
        onValueChange={setActiveTab} 
        className="w-full"
      >
        <TabsList className="grid w-full grid-cols-5 mb-4">
          {sections.map((section, index) => (
            <TabsTrigger 
              key={index} 
              value={section.title.toLowerCase().replace(/\s+/g, '')}
              className="flex items-center space-x-2"
            >
              {section.icon}
              <span className="hidden md:inline">{section.title}</span>
            </TabsTrigger>
          ))}
        </TabsList>

        {sections.map((section, index) => (
          <TabsContent 
            key={index} 
            value={section.title.toLowerCase().replace(/\s+/g, '')}
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  {section.icon}
                  <span>{section.title}</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[400px] w-full rounded-md border p-4">
                  <div className="whitespace-pre-line text-muted-foreground">
                    {section.content}
                  </div>
                  <Separator className="my-4" />
                  <div className="text-sm text-gray-500">
                    Last updated: {new Date().toLocaleDateString()}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>
        ))}
      </Tabs>

      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <CheckCircle className="w-6 h-6 text-green-500" />
            <span>Key Recommendations</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          {[
            "Consult Healthcare Professional",
            "Start Slow and Gradual",
            "Consistent Monitoring",
            "Personalized Approach",
            "Professional Guidance"
          ].map((rec, index) => (
            <Badge key={index} variant="secondary">
              {rec}
            </Badge>
          ))}
        </CardContent>
      </Card>

      <div className="flex justify-center space-x-4">
        <Button variant="outline">
          Export Plan
        </Button>
        <Button>
          Share with Professional
        </Button>
      </div>
    </div>
  );
};

export default HealthPlanDashboard;