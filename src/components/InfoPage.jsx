import React, { useState } from 'react';
import { Input } from "./ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Textarea } from "./ui/textarea";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Label } from "./ui/label";
import { useNavigate } from 'react-router-dom';
import { 
  User, 
  Calendar, 
  MapPin, 
  Target, 
  Ruler, 
  Weight, 
  HeartPulse, 
  Dumbbell, 
  BookOpenText, 
  Moon, 
  Watch,
  AlertCircle,
  LogOut
} from 'lucide-react';
import apiClient from '../lib/apiClient';

const InfoPage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: 'Samrat Dey',
    age: '30',
    gender: 'male',
    location: 'New York, USA',
    fitnessGoal: 'weightLoss',
    height: '185',
    weight: '90',
    bodyMeasurements: 'Chest: 56 in, Waist: 40 in, Hips: 46 in',
    bodyFatPercentage: '18',
    activityLevel: 'Moderately active (3-5 workouts per week)',
    dietaryPreferences: 'High-protein, low-carb diet',
    exerciseHabits: 'Strength training and cardio mix, 4 days per week',
    medicalHistory: 'No chronic conditions, history of mild knee injury',
    sleepPatterns: '6-7 hours per night, working on improving consistency',
    wearableData: 'Average daily steps: 8,000; Resting heart rate: 65 bpm'
  });
  
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  const validateInputs = () => {
    const requiredFields = [
      'name', 'age', 'gender', 'fitnessGoal', 
      'height', 'weight'
    ];
    for (const field of requiredFields) {
      if (!formData[field]) {
        setError(`Please fill in the ${field} field.`);
        return false;
      }
    }
    if (formData.age <= 0 || formData.height <= 0 || formData.weight <= 0) {
      setError("Age, height, and weight must be positive numbers.");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!validateInputs()) return;

    setLoading(true);

    try {
      const additionalInstructions = `
        Generate a comprehensive, structured health and fitness plan with the following guidelines:
        
        Response Structure:
        - Use clear, actionable language
        - Format with markdown headers
        - Include specific, practical recommendations
        - Emphasize professional medical consultation
        
        Key Sections:
        1. Profile Overview: Brief summary of user's current health status
        2. Dietary Recommendations
        3. Exercise Program
        4. Lifestyle and Recovery
        5. Monitoring and Adaptation
      `;

      const promptData = {
        ...formData,
        instructions: additionalInstructions,
      };

      const response = await apiClient.post('/ai/generate', { 
        prompt: JSON.stringify(promptData),
      });

      navigate('/dashboard', { 
        state: { 
          healthPlanResponse: response.plan.content,
          userProfile: formData,
          planId: response.plan.id
        } 
      });
    } catch (err) {
      setError(err.message || "An error occurred while generating the plan. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    apiClient.setToken(null);
    navigate('/login');
  };

  const renderInputSection = (label, name, icon, type = 'text', placeholder = '') => (
    <div className="space-y-2 group">
      <div className="flex items-center space-x-2 mb-2">
        {React.cloneElement(icon, {
          className: "text-primary group-hover:text-primary/70 transition-colors"
        })}
        <Label htmlFor={name} className="group-hover:text-primary/70 transition-colors">
          {label}
        </Label>
      </div>
      <Input
        id={name}
        name={name}
        type={type}
        value={formData[name]}
        onChange={handleChange}
        placeholder={placeholder || `Enter your ${label.toLowerCase()}`}
        className="w-full border-2 border-gray-200 focus:border-primary transition-all duration-300 hover:shadow-sm"
      />
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white py-12">
      <Card className="max-w-4xl mx-auto shadow-2xl rounded-2xl overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-primary to-primary/80 text-white p-6 flex items-center justify-between">
          <CardTitle className="text-4xl font-bold flex items-center space-x-4">
            <HeartPulse className="w-12 h-12" />
            <span>Personal Fitness Profile</span>
          </CardTitle>
          <Button
            variant="outline"
            onClick={handleLogout}
            className="bg-white/20 hover:bg-white/30 text-white border-white"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </Button>
        </CardHeader>
        <CardContent className="p-8 space-y-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Personal Information Grid */}
            <div className="grid md:grid-cols-2 gap-6">
              {renderInputSection('Name', 'name', <User />, 'text', 'Full Name')}
              {renderInputSection('Age', 'age', <Calendar />, 'number', 'Your Age')}
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-2 group">
                <div className="flex items-center space-x-2 mb-2">
                  <MapPin className="text-primary group-hover:text-primary/70 transition-colors" />
                  <Label className="group-hover:text-primary/70 transition-colors">Location</Label>
                </div>
                <Select 
                  name="location"
                  value={formData.location}
                  onValueChange={(value) => setFormData(prev => ({...prev, location: value}))}
                >
                  <SelectTrigger className="border-2 border-gray-200 focus:border-primary hover:shadow-sm transition-all duration-300">
                    <SelectValue placeholder="Select Location" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="New York, USA">New York, USA</SelectItem>
                    <SelectItem value="Los Angeles, USA">Los Angeles, USA</SelectItem>
                    <SelectItem value="Chicago, USA">Chicago, USA</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2 group">
                <div className="flex items-center space-x-2 mb-2">
                  <Target className="text-primary group-hover:text-primary/70 transition-colors" />
                  <Label className="group-hover:text-primary/70 transition-colors">Fitness Goal</Label>
                </div>
                <Select 
                  name="fitnessGoal"
                  value={formData.fitnessGoal}
                  onValueChange={(value) => setFormData(prev => ({...prev, fitnessGoal: value}))}
                >
                  <SelectTrigger className="border-2 border-gray-200 focus:border-primary hover:shadow-sm transition-all duration-300">
                    <SelectValue placeholder="Select Fitness Goal" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="weightLoss">Weight Loss</SelectItem>
                    <SelectItem value="muscleGain">Muscle Gain</SelectItem>
                    <SelectItem value="generalFitness">General Fitness</SelectItem>
                    <SelectItem value="endurance">Endurance</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Physical Stats */}
            <div className="grid md:grid-cols-3 gap-6">
              {renderInputSection('Height (cm)', 'height', <Ruler />, 'number', 'Your Height')}
              {renderInputSection('Weight (kg)', 'weight', <Weight />, 'number', 'Your Weight')}
              {renderInputSection('Body Fat %', 'bodyFatPercentage', <HeartPulse />, 'number', 'Body Fat %')}
            </div>

            {/* Detailed Inputs with Icons */}
            <div className="space-y-6">
              {[
                { 
                  name: 'dietaryPreferences', 
                  label: 'Dietary Preferences', 
                  icon: <Dumbbell />,
                  placeholder: 'Describe your diet preferences and restrictions'
                },
                { 
                  name: 'exerciseHabits', 
                  label: 'Exercise Habits', 
                  icon: <BookOpenText />,
                  placeholder: 'Types of exercises, frequency, and intensity'
                },
                { 
                  name: 'medicalHistory', 
                  label: 'Medical History', 
                  icon: <HeartPulse />,
                  placeholder: 'Any medical conditions or injuries'
                },
                { 
                  name: 'sleepPatterns', 
                  label: 'Sleep Patterns', 
                  icon: <Moon />,
                  placeholder: 'Average hours of sleep and quality'
                },
                { 
                  name: 'wearableData', 
                  label: 'Wearable Data', 
                  icon: <Watch />,
                  placeholder: 'Wearable metrics like heart rate or steps'
                }
              ].map(({ name, label, icon, placeholder }) => (
                <div key={name} className="space-y-2 group">
                  <div className="flex items-center space-x-2 mb-2">
                    {React.cloneElement(icon, {
                      className: "text-primary group-hover:text-primary/70 transition-colors"
                    })}
                    <Label htmlFor={name} className="group-hover:text-primary/70 transition-colors">
                      {label}
                    </Label>
                  </div>
                  <Textarea
                    id={name}
                    name={name}
                    value={formData[name]}
                    onChange={handleChange}
                    placeholder={placeholder}
                    className="min-h-[120px] border-2 border-gray-200 focus:border-primary transition-all duration-300 hover:shadow-sm"
                  />
                </div>
              ))}
            </div>

            {/* Submit Button with Animation */}
            <div className="flex justify-center">
              <Button 
                type="submit"
                disabled={loading}
                className="w-full max-w-md bg-gradient-to-r from-primary to-primary/80 hover:from-primary/80 hover:to-primary transition-all duration-300 transform hover:scale-105"
              >
                {loading ? 'Generating Plan...' : 'Generate Health Plan'}
              </Button>
            </div>
          </form>

          {/* Error Handling */}
          {error && (
            <div className="text-center mt-4 p-4 bg-red-50 border-2 border-red-200 rounded-lg flex items-start space-x-2">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <p className="text-red-600 font-semibold">{error}</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default InfoPage;
