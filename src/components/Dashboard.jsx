import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import HealthPlanDashboard from './HealthPlanDashboard';
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";

const Dashboard = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // If no state is passed, redirect back to info page
  const healthPlanResponse = location.state?.healthPlanResponse;
  const userProfile = location.state?.userProfile;

  if (!healthPlanResponse) {
    navigate('/');
    return null;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Card className="max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle className="text-3xl font-bold text-center text-primary">
            Your Personal Health Dashboard
          </CardTitle>
        </CardHeader>
        <CardContent>
          <HealthPlanDashboard 
            response={healthPlanResponse} 
            userProfile={userProfile} 
          />
          <div className="flex justify-center mt-6 space-x-4">
            <Button variant="outline" onClick={() => navigate('/')}>
              Edit Profile
            </Button>
            <Button onClick={() => {/* Implement print or export functionality */}}>
              Export Plan
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;