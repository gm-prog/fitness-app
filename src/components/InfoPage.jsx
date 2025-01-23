import React, { useState } from 'react';
import { Input } from "./ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Textarea } from "./ui/textarea";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Label } from "./ui/label";

const InfoPage = () => {
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

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Form Data:', formData);
    // Add your submission logic here
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
              <Label htmlFor="activityLevel">Activity Level</Label>
              <Select 
                name="activityLevel"
                value={formData.activityLevel}
                onValueChange={(value) => setFormData(prev => ({...prev, activityLevel: value}))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select your activity level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="sedentary">Sedentary</SelectItem>
                  <SelectItem value="lightActivity">Light Activity</SelectItem>
                  <SelectItem value="moderateActivity">Moderate Activity</SelectItem>
                  <SelectItem value="veryActive">Very Active</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Textareas for Detailed Information */}
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

            <div className="flex justify-center">
              <Button type="submit" className="w-full max-w-md">
                Save Profile
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default InfoPage;