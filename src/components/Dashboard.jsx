import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import HealthPlanDashboard from './HealthPlanDashboard';
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";

const Dashboard = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const healthPlanResponse = location.state?.healthPlanResponse;
  const userProfile = location.state?.userProfile;

  if (!healthPlanResponse) {
    navigate('/');
    return null;
  }

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="container mx-auto px-4 py-8 bg-blue-50/30"
    >
      <Card className="max-w-4xl mx-auto bg-white/80 backdrop-blur-sm border-blue-200 shadow-xl">
        <CardHeader>
          <CardTitle className="text-3xl font-bold text-center text-blue-800">
            Your Personal Health Dashboard
          </CardTitle>
        </CardHeader>
        <CardContent>
          <HealthPlanDashboard 
            response={healthPlanResponse} 
            userProfile={userProfile} 
          />
          <div className="flex justify-center mt-6 space-x-4">
            <Button 
              variant="outline" 
              onClick={() => navigate('/')}
              className="border-blue-300 text-blue-800 hover:bg-blue-100"
            >
              Edit Profile
            </Button>
            <Button 
              onClick={() => {/* Implement print or export functionality */}}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              Export Plan
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default Dashboard;