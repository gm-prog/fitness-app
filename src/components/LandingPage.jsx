import React from 'react';
import { Medal, Users, Brain, Share2, Smartphone, ArrowRight, Activity } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import { useNavigate} from 'react-router-dom';

const LandingPage = () => {

  const navigate = useNavigate();//initialize

  const navigateToInfo=()=>{
    navigate('/info') 
  }

  const features = [
    {
      icon: <Medal className="h-8 w-8 mb-4 text-blue-500" />,
      title: "Real-time Leaderboards",
      description: "Compete with friends and track your progress on dynamic leaderboards. Stay motivated by seeing where you stand in your fitness journey."
    },
    {
      icon: <Brain className="h-8 w-8 mb-4 text-purple-500" />,
      title: "AI-Powered Workouts",
      description: "Get personalized workout plans that adapt to your progress, preferences, and goals using advanced AI technology."
    },
    {
      icon: <Share2 className="h-8 w-8 mb-4 text-green-500" />,
      title: "Social Sharing",
      description: "Share your achievements, milestones, and workout routines with friends. Build a supportive community that keeps you accountable."
    },
    {
      icon: <Smartphone className="h-8 w-8 mb-4 text-red-500" />,
      title: "Device Integration",
      description: "Seamlessly connect with your favorite fitness devices and apps. Track everything in one place for a complete fitness picture."
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            <Activity className="h-16 w-16 text-blue-600 mx-auto mb-8" />
            <h1 className="text-5xl font-bold text-gray-900 mb-6">
              Transform Your Fitness Journey
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-8">
              Join the most engaging fitness community. Get personalized AI workouts, compete with friends, and achieve your goals together.
            </p>
            <Button 
            onClick={navigateToInfo}
            className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-6 rounded-full text-lg font-semibold">
              Start Your Journey Now
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <p className="mt-4 text-sm text-gray-500">
              14-day free trial • No credit card required
            </p>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-3 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold text-blue-600 mb-2">500K+</div>
              <div className="text-gray-600">Active Users</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-blue-600 mb-2">10M+</div>
              <div className="text-gray-600">Workouts Completed</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-blue-600 mb-2">98%</div>
              <div className="text-gray-600">User Satisfaction</div>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Everything You Need to Succeed
            </h2>
            <p className="text-xl text-gray-600">
              Powerful features designed to keep you motivated and on track
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6 text-center">
                  {feature.icon}
                  <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                  <p className="text-gray-600">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-blue-600 text-white py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold mb-6">
            Ready to Transform Your Fitness Journey?
          </h2>
          <p className="text-xl mb-8 opacity-90">
            Join millions of users who have already achieved their fitness goals
          </p>
          <Button onClick={navigateToInfo}  className="bg-white text-blue-600 hover:bg-gray-100 px-8 py-6 rounded-full text-lg font-semibold">
         
            Get Started Free
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;