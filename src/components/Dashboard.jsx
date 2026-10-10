import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import HealthPlanDashboard from './HealthPlanDashboard';
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { LogOut } from 'lucide-react';
import apiClient from '../lib/apiClient';

const Dashboard = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const healthPlanResponse = location.state?.healthPlanResponse;
  const userProfile = location.state?.userProfile;
  const planId = location.state?.planId;

  if (!healthPlanResponse) {
    navigate('/');
    return null;
  }

  const handleLogout = () => {
    apiClient.setToken(null);
    navigate('/login');
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="container mx-auto px-4 py-8 bg-blue-50/30"
    >
      <Card className="max-w-4xl mx-auto bg-white/80 backdrop-blur-sm border-blue-200 shadow-xl">
        <CardHeader className="flex items-center justify-between">
          <CardTitle className="text-3xl font-bold text-center text-blue-800">
            Your Personal Health Dashboard
          </CardTitle>
          <Button
            variant="outline"
            onClick={handleLogout}
            className="border-blue-300 text-blue-800 hover:bg-blue-100"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </Button>
        </CardHeader>
        <CardContent>
          <HealthPlanDashboard 
            response={healthPlanResponse} 
            userProfile={userProfile}
            planId={planId}
          />
          <div className="flex justify-center mt-6 space-x-4">
            <Button 
              variant="outline" 
              onClick={() => navigate('/info')}
              className="border-blue-300 text-blue-800 hover:bg-blue-100"
            >
              Create New Plan
            </Button>
            <Button 
              onClick={() => {
                const element = document.createElement('a');
                const file = new Blob([healthPlanResponse], {type: 'text/plain'});
                element.href = URL.createObjectURL(file);
                element.download = 'health-plan.txt';
                document.body.appendChild(element);
                element.click();
                document.body.removeChild(element);
              }}
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
