import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ClerkProvider, SignedIn, SignedOut, RedirectToSignIn } from '@clerk/clerk-react';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Pricing from './pages/Pricing';
import Login from './pages/Login';
import Signup from './pages/Signup';

const CLERK_PUBLISHABLE_KEY = "pk_test_d2hvbGUtYW50LTEyLmNsZXJrLmFjY291bnRzLmRldiQ";

function AppRoutes() {
    return (
        <Routes>
            <Route path="/login/*" element={<Login />} />
            <Route path="/signup/*" element={<Signup />} />
            <Route path="/" element={
                <>
                    <SignedIn>
                        <Layout><Dashboard /></Layout>
                    </SignedIn>
                    <SignedOut>
                        <RedirectToSignIn />
                    </SignedOut>
                </>
            } />
            <Route path="/pricing" element={
                <>
                    <SignedIn>
                        <Layout><Pricing /></Layout>
                    </SignedIn>
                    <SignedOut>
                        <RedirectToSignIn />
                    </SignedOut>
                </>
            } />
            <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
    );
}

function App() {
    return (
        <ClerkProvider 
            publishableKey={CLERK_PUBLISHABLE_KEY}
            afterSignInUrl="/"
            afterSignUpUrl="/"
        >
            <Router>
                <AppRoutes />
            </Router>
        </ClerkProvider>
    );
}

export default App;
