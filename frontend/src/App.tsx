import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import './App.css';

// Import components and pages
import PrivateRoute from './components/PrivateRoute';
import NavBar from './components/NavBar';
import Login from './pages/Login';
import Home from './pages/Home';
import Collections from './pages/Collections';
import CollectionDetail from './pages/CollectionDetail';
import CreateCollection from './pages/CreateCollection';
import CreateQA from './pages/CreateQA';
import ReviewQA from './pages/ReviewQA';

// Import context providers
import { AuthProvider } from './contexts/AuthContext';
import { CollectionsProvider } from './contexts/CollectionsContext';

/**
 * Main Application Component
 * 
 * This component sets up the application's routing and context providers.
 */
function App() {
  return (
    <AuthProvider>
      <CollectionsProvider>
        <Router>
          <div className="App">
            <NavBar />
            <main className="App-content">
              <Routes>
                <Route path="/login" element={<Login />} />
                <Route path="/" element={<PrivateRoute><Home /></PrivateRoute>} />
                <Route path="/collections" element={<PrivateRoute><Collections /></PrivateRoute>} />
                <Route path="/collections/new" element={<PrivateRoute><CreateCollection /></PrivateRoute>} />
                <Route path="/collections/:id" element={<PrivateRoute><CollectionDetail /></PrivateRoute>} />
                <Route path="/create-qa/:collectionId" element={<PrivateRoute><CreateQA /></PrivateRoute>} />
                <Route path="/review-qa/:qaId" element={<PrivateRoute><ReviewQA /></PrivateRoute>} />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </main>
          </div>
        </Router>
      </CollectionsProvider>
    </AuthProvider>
  );
}

export default App;
