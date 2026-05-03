import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Pricing from './pages/Pricing';
import Login from './pages/Login';
import Signup from './pages/Signup';

// Protected route wrapper
function PrivateRoute({ children }) {
    const { user, loading } = useAuth();
    if (loading) {
        return (
            <div className="min-h-screen bg-slate-950 flex items-center justify-center">
                <div className="text-emerald-400 animate-pulse text-lg">Loading...</div>
            </div>
        );
    }
    return user ? children : <Navigate to="/login" replace />;
}

function AppRoutes() {
    const { user } = useAuth();
    return (
        <Routes>
            <Route path="/login" element={user ? <Navigate to="/" replace /> : <Login />} />
            <Route path="/signup" element={user ? <Navigate to="/" replace /> : <Signup />} />
            <Route path="/" element={
                <PrivateRoute>
                    <Layout><Dashboard /></Layout>
                </PrivateRoute>
            } />
            <Route path="/pricing" element={
                <PrivateRoute>
                    <Layout><Pricing /></Layout>
                </PrivateRoute>
            } />
            <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
    );
}

import { GoogleOAuthProvider } from '@react-oauth/google';

function App() {
    return (
        <GoogleOAuthProvider clientId="909289297592-pue9e5f4n3667q366h6p3h6p3h6p3h6p.apps.googleusercontent.com"> {/* User should replace this */}
            <AuthProvider>
                <Router>
                    <AppRoutes />
                </Router>
            </AuthProvider>
        </GoogleOAuthProvider>
    );
}

export default App;
