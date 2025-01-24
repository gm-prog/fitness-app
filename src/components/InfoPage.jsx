import React, { useState } from 'react';
import { Input } from "./ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Textarea } from "./ui/textarea";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Label } from "./ui/label";
import HealthPlanDashboard from './HealthPlanDashboard';
import { useNavigate} from 'react-router-dom';
 
const InfoPage = () => {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    name: '',
    age: '',
    gender: '',
    location: '',
    fitnessGoal: '',
    height: '',
    weight: '',
    bodyMeasurements: '',
    bodyFatPercentage: '',
    activityLevel: '',
    dietaryPreferences: '',
    exerciseHabits: '',
    medicalHistory: '',
    sleepPatterns: '',
    wearableData: ''
  });
  
  const [error, setError] = useState(null); // For error messages
  const [response, setResponse] = useState(null); // For server responses

  const navigateToDashboard=()=>{
    navigate('/dashboard') 
  }

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  const validateInputs = () => {
    const requiredFields = [
      'name',
      'age',
      'gender',
      'fitnessGoal',
      'height',
      'weight',
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
    setResponse(null);
  
    if (!validateInputs()) return;
  
    try {
      const baseURI = "https://7jr5h9nt-3000.inc1.devtunnels.ms/ai/generate";
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
          - Nutritional strategies
          - Meal planning advice
          - Specific food recommendations
        3. Exercise Program
          - Phased approach
          - Exercise types and progression
          - Intensity and frequency guidelines
        4. Lifestyle and Recovery
          - Sleep optimization
          - Stress management
          - Recovery strategies
        5. Monitoring and Adaptation
          - Progress tracking methods
          - When and how to adjust the plan
        
        Critical Notes:
        - Strongly recommend professional medical consultation
        - Provide context-specific, personalized advice
        - Balance aspirational goals with realistic expectations
      `;
  
      const promptData = {
        ...formData,
        instructions: additionalInstructions,
      };
  
      const response = await fetch(baseURI, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ 
          prompt: JSON.stringify(promptData),
         
        }),
      });
  
      if (!response.ok) {
        throw new Error("Failed to fetch data from the server.");
      }
  
      const result = await response.json();
      navigate('/dashboard', { 
        state: { 
          healthPlanResponse: result.content,
          userProfile: formData 
        } 
      });
    } catch (err) {
      setError(err.message || "An error occurred while submitting the form.");
    }
  };
  
  

  return (
    <div className="container mx-auto px-4 py-8">
      <Card className="max-w-2xl mx-auto shadow-lg">
        <CardHeader>
          <CardTitle className="text-3xl font-bold text-center text-primary">
            Personal Fitness Profile
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Personal Information Section */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Enter your full name"
                  className="w-full"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="age">Age</Label>
                <Input
                  id="age"
                  name="age"
                  type="number"
                  value={formData.age}
                  onChange={handleChange}
                  placeholder="Your age"
                  className="w-full"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="gender">Gender</Label>
                <Select 
                  name="gender"
                  value={formData.gender}
                  onValueChange={(value) => setFormData(prev => ({...prev, gender: value}))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select gender" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="male">Male</SelectItem>
                    <SelectItem value="female">Female</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  placeholder="City, Country"
                  className="w-full"
                />
              </div>
            </div>

            {/* Fitness Goals */}
            <div className="space-y-2">
              <Label htmlFor="fitnessGoal">Fitness Goal</Label>
              <Select 
                name="fitnessGoal"
                value={formData.fitnessGoal}
                onValueChange={(value) => setFormData(prev => ({...prev, fitnessGoal: value}))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select your primary fitness goal" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="weightLoss">Weight Loss</SelectItem>
                  <SelectItem value="muscleGain">Muscle Gain</SelectItem>
                  <SelectItem value="generalFitness">General Fitness</SelectItem>
                  <SelectItem value="endurance">Endurance</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Physical Stats */}
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="height">Height (cm)</Label>
                <Input
                  id="height"
                  name="height"
                  type="number"
                  value={formData.height}
                  onChange={handleChange}
                  placeholder="Your height"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="weight">Weight (kg)</Label>
                <Input
                  id="weight"
                  name="weight"
                  type="number"
                  value={formData.weight}
                  onChange={handleChange}
                  placeholder="Your weight"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="bodyFatPercentage">Body Fat %</Label>
                <Input
                  id="bodyFatPercentage"
                  name="bodyFatPercentage"
                  type="number"
                  value={formData.bodyFatPercentage}
                  onChange={handleChange}
                  placeholder="Body fat %"
                />
              </div>
            </div>

            {/* Additional Details */}
            <div className="space-y-2">
              <Label htmlFor="bodyMeasurements">Body Measurements</Label>
              <Textarea
                id="bodyMeasurements"
                name="bodyMeasurements"
                value={formData.bodyMeasurements}
                onChange={handleChange}
                placeholder="Chest, waist, hips, etc."
                className="min-h-[100px]"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="dietaryPreferences">Dietary Preferences</Label>
              <Textarea
                id="dietaryPreferences"
                name="dietaryPreferences"
                value={formData.dietaryPreferences}
                onChange={handleChange}
                placeholder="Describe your diet, preferences, and restrictions"
                className="min-h-[100px]"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="exerciseHabits">Exercise Habits</Label>
              <Textarea
                id="exerciseHabits"
                name="exerciseHabits"
                value={formData.exerciseHabits}
                onChange={handleChange}
                placeholder="Types of exercises, frequency, and intensity"
                className="min-h-[100px]"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="medicalHistory">Medical History</Label>
              <Textarea
                id="medicalHistory"
                name="medicalHistory"
                value={formData.medicalHistory}
                onChange={handleChange}
                placeholder="Any medical conditions or injuries"
                className="min-h-[100px]"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="sleepPatterns">Sleep Patterns</Label>
              <Textarea
                id="sleepPatterns"
                name="sleepPatterns"
                value={formData.sleepPatterns}
                onChange={handleChange}
                placeholder="Average hours of sleep and quality"
                className="min-h-[100px]"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="wearableData">Wearable Data</Label>
              <Textarea
                id="wearableData"
                name="wearableData"
                value={formData.wearableData}
                onChange={handleChange}
                placeholder="Wearable metrics like heart rate or steps"
                className="min-h-[100px]"
              />
            </div>

            <div className="flex justify-center">
              <Button
              
              type="submit" className="w-full max-w-md">
                Save Profile
              </Button>
            </div>
          </form>
          {error && <p className="text-red-600 text-center mt-4">{error}</p>}
          

        </CardContent>
      </Card>
    </div>
  );
};

export default InfoPage;
