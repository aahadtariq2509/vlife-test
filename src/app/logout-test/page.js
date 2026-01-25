'use client';

import { useAuth } from '@/features/auth/hooks/useAuth';
import { useState, useEffect } from 'react';

export default function LogoutTestPage() {
  const { user, isAuthenticated, logout, isLoading } = useAuth();
  const [testResults, setTestResults] = useState([]);
  const [localStorageData, setLocalStorageData] = useState({});

  const updateLocalStorageData = () => {
    if (typeof window !== 'undefined') {
      setLocalStorageData({
        accessToken: localStorage.getItem('accessToken'),
        refreshToken: localStorage.getItem('refreshToken'),
        userData: localStorage.getItem('userData'),
      });
    }
  };

  useEffect(() => {
    updateLocalStorageData();
  }, []);

  const testLogout = async () => {
    const results = [];
    
    // Test 1: Check initial state
    results.push({
      test: 'Initial State Check',
      status: isAuthenticated ? 'PASS' : 'FAIL',
      details: `User authenticated: ${isAuthenticated}, User: ${user?.name || 'None'}`
    });

    // Test 2: Check localStorage before logout
    const beforeLogout = {
      accessToken: localStorage.getItem('accessToken'),
      refreshToken: localStorage.getItem('refreshToken'),
      userData: localStorage.getItem('userData'),
    };
    
    results.push({
      test: 'localStorage Before Logout',
      status: beforeLogout.accessToken ? 'PASS' : 'FAIL',
      details: `Access token exists: ${!!beforeLogout.accessToken}`
    });

    // Test 3: Perform logout
    try {
      const logoutResult = await logout();
      results.push({
        test: 'Logout API Call',
        status: logoutResult?.success ? 'PASS' : 'FAIL',
        details: `API Success: ${logoutResult?.apiSuccess}, Message: ${logoutResult?.message}`
      });
    } catch (error) {
      results.push({
        test: 'Logout API Call',
        status: 'FAIL',
        details: `Error: ${error.message}`
      });
    }

    // Test 4: Check localStorage after logout
    const afterLogout = {
      accessToken: localStorage.getItem('accessToken'),
      refreshToken: localStorage.getItem('refreshToken'),
      userData: localStorage.getItem('userData'),
    };
    
    results.push({
      test: 'localStorage After Logout',
      status: !afterLogout.accessToken ? 'PASS' : 'FAIL',
      details: `Access token cleared: ${!afterLogout.accessToken}`
    });

    // Test 5: Check auth state after logout
    results.push({
      test: 'Auth State After Logout',
      status: !isAuthenticated ? 'PASS' : 'FAIL',
      details: `User authenticated: ${isAuthenticated}`
    });

    setTestResults(results);
    updateLocalStorageData();
  };

  const clearResults = () => {
    setTestResults([]);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">
          Logout Functionality Test
        </h1>

        {/* Current State */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Current State
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-600">Authentication Status:</p>
              <p className={`font-medium ${isAuthenticated ? 'text-green-600' : 'text-red-600'}`}>
                {isAuthenticated ? 'Authenticated' : 'Not Authenticated'}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">User:</p>
              <p className="font-medium text-gray-900">
                {user?.name || 'No user'}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Loading:</p>
              <p className={`font-medium ${isLoading ? 'text-yellow-600' : 'text-gray-600'}`}>
                {isLoading ? 'Yes' : 'No'}
              </p>
            </div>
          </div>
        </div>

        {/* localStorage Data */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            localStorage Data
          </h2>
          <div className="space-y-2">
            <div>
              <p className="text-sm text-gray-600">Access Token:</p>
              <p className="font-mono text-xs bg-gray-100 p-2 rounded">
                {localStorageData.accessToken || 'Not set'}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Refresh Token:</p>
              <p className="font-mono text-xs bg-gray-100 p-2 rounded">
                {localStorageData.refreshToken || 'Not set'}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">User Data:</p>
              <p className="font-mono text-xs bg-gray-100 p-2 rounded">
                {localStorageData.userData || 'Not set'}
              </p>
            </div>
          </div>
        </div>

        {/* Test Controls */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Test Controls
          </h2>
          <div className="flex space-x-4">
            <button
              onClick={testLogout}
              disabled={isLoading}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Testing...' : 'Test Logout'}
            </button>
            <button
              onClick={clearResults}
              className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
            >
              Clear Results
            </button>
            <button
              onClick={updateLocalStorageData}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
            >
              Refresh localStorage Data
            </button>
          </div>
        </div>

        {/* Test Results */}
        {testResults.length > 0 && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Test Results
            </h2>
            <div className="space-y-3">
              {testResults.map((result, index) => (
                <div
                  key={index}
                  className={`p-4 rounded-lg border ${
                    result.status === 'PASS'
                      ? 'bg-green-50 border-green-200/20'
                      : 'bg-red-50 border-red-200/20'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <h3 className="font-medium text-gray-900">
                      {result.test}
                    </h3>
                    <span
                      className={`px-2 py-1 rounded text-xs font-medium ${
                        result.status === 'PASS'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {result.status}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mt-1">
                    {result.details}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
