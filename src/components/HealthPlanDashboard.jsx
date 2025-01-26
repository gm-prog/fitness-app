import React, { useState, useEffect } from 'react';
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
import { motion } from 'framer-motion';

const parseHealthPlanSections = (response) => {
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
      "Sleep Cycle", 
      "Monitoring",
    ];
  
    const sections = sectionTitles.map((title) => {
      const regex = new RegExp(`\\*\\*${title}\\*\\*(.*?)(?=\\*\\*[A-Z]|$)`, 's');
      const match = response.match(regex);
      
      return {
        title,
        icon: getIconForSection(title),
        content: match ? match[1].trim() : `No ${title} information available.`
      };
    });
  
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
    "Introduction": <Heart className="w-6 h-6 text-blue-600" />,
    "Dietary Plan": <Utensils className="w-6 h-6 text-blue-600" />,
    "Exercise Plan": <Activity className="w-6 h-6 text-blue-600" />,
    "Sleep and Recovery": <Bed className="w-6 h-6 text-blue-600" />,
    "Monitoring and Follow-Up": <BarChart className="w-6 h-6 text-blue-600" />
  };
  return iconMap[title] || <CheckCircle className="w-6 h-6 text-blue-600" />;
};

const HealthPlanDashboard = ({ response, userProfile }) => {
    const [activeTab, setActiveTab] = useState("introduction");
    const [isLoaded, setIsLoaded] = useState(false);

    useEffect(() => {
      setIsLoaded(true);
    }, []);

    if (!response) {
      return (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-4xl mx-auto p-4"
        >
          <Card className="bg-blue-50/50 backdrop-blur-sm border-blue-200 shadow-lg">
            <CardContent className="text-center py-12">
              <AlertCircle className="mx-auto mb-4 h-12 w-12 text-blue-600" />
              <p className="text-xl text-blue-800">
                No health plan response received. Please try submitting the form again.
              </p>
            </CardContent>
          </Card>
        </motion.div>
      );
    }

    const sections = parseHealthPlanSections(response);
    const ProfileSummary = userProfile && (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: isLoaded ? 1 : 0, y: isLoaded ? 0 : 20 }}
        transition={{ duration: 0.5 }}
      >
        <Card className="mb-6 bg-blue-50/50 backdrop-blur-sm border-blue-200 shadow-lg">
          <CardHeader>
            <CardTitle className="text-blue-800">Profile Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4 text-blue-900">
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
      </motion.div>
    );

    return (
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-4xl mx-auto p-4 space-y-6"
      >
        {ProfileSummary}
        <Card className="w-full bg-blue-50/50 backdrop-blur-sm border-blue-200 shadow-lg">
          <CardHeader>
            <CardTitle className="text-3xl font-bold text-blue-800 flex items-center justify-between">
              <span>Personalized Health Plan</span>
              <Badge variant="outline" className="text-blue-700 border-blue-300">
                <AlertCircle className="mr-2 h-4 w-4 text-blue-600" /> Professional Guidance
              </Badge>
            </CardTitle>
            <CardDescription className="text-blue-600">
              A comprehensive, data-driven approach to your health and wellness journey
            </CardDescription>
          </CardHeader>
        </Card>

        <Tabs 
          value={activeTab} 
          onValueChange={setActiveTab} 
          className="w-full"
        >
          <TabsList className="grid w-full grid-cols-5 mb-4 bg-blue-100 border border-blue-200">
            {sections.map((section, index) => (
              <TabsTrigger 
                key={index} 
                value={section.title.toLowerCase().replace(/\s+/g, '')}
                className="flex items-center space-x-2 text-blue-800 hover:bg-blue-200 data-[state=active]:bg-blue-300 data-[state=active]:text-blue-900"
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
              <Card className="bg-blue-50/50 backdrop-blur-sm border-blue-200 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2 text-blue-800">
                    {section.icon}
                    <span>{section.title}</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-[400px] w-full rounded-md border border-blue-200 p-4">
                    <div className="whitespace-pre-line text-blue-900">
                      {section.content}
                    </div>
                    <Separator className="my-4 bg-blue-200" />
                    <div className="text-sm text-blue-600">
                      Last updated: {new Date().toLocaleDateString()}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
            </TabsContent>
          ))}
        </Tabs>

        <Card className="w-full bg-blue-50/50 backdrop-blur-sm border-blue-200 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-blue-800">
              <CheckCircle className="w-6 h-6 text-blue-600" />
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
              <Badge 
                key={index} 
                variant="secondary" 
                className="bg-blue-100 text-blue-800 border-blue-300"
              >
                {rec}
              </Badge>
            ))}
          </CardContent>
        </Card>

        <div className="flex justify-center space-x-4">
          <Button 
            variant="outline" 
            className="border-blue-300 text-blue-800 hover:bg-blue-100"
          >
            Export Plan
          </Button>
          <Button 
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            Share with Professional
          </Button>
        </div>
      </motion.div>
    );
};

export default HealthPlanDashboard;