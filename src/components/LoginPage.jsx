import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { LogIn, AlertCircle } from 'lucide-react';
import apiClient from '../lib/apiClient';

const LoginPage = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const result = await apiClient.post('/auth/login', {
        email,
        password,
      });

      apiClient.setToken(result.token);
      navigate('/info');
    } catch (err) {
      setError(err.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white flex items-center justify-center py-12 px-4">
      <Card className="max-w-md w-full shadow-2xl rounded-2xl">
        <CardHeader className="bg-gradient-to-r from-blue-600 to-blue-500 text-white p-6">
          <CardTitle className="text-3xl font-bold text-center flex items-center justify-center space-x-2">
            <LogIn className="w-8 h-8" />
            <span>Login</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-8 space-y-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="border-2 border-gray-200 focus:border-blue-500"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="border-2 border-gray-200 focus:border-blue-500"
              />
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white"
            >
              {loading ? 'Logging in...' : 'Login'}
            </Button>
          </form>

          {error && (
            <div className="p-4 bg-red-50 border-2 border-red-200 rounded-lg flex items-start space-x-2">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          )}

          <div className="text-center space-y-2">
            <p className="text-gray-600">Don't have an account?</p>
            <Button
              variant="outline"
              className="w-full border-blue-300 text-blue-600 hover:bg-blue-50"
              onClick={() => navigate('/register')}
            >
              Sign Up
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default LoginPage;
