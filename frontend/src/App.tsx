import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import './App.css';

// Import components and pages
import PrivateRoute from './features/auth/components/PrivateRoute';
import NavBar from './components/layout/NavBar';
import Login from './features/auth/pages/Login';
import Home from './features/core/pages/Home';
import Collections from './features/collections/pages/Collections';
import CollectionDetail from './features/collections/pages/CollectionDetail';
import CreateCollection from './features/collections/pages/CreateCollection';
import CreateQA from './features/generation/pages/CreateQA';
import ReviewQA from './features/generation/pages/ReviewQA';

// Import context providers
import { AuthProvider } from './features/auth/contexts/AuthContext';
import { CollectionsProvider } from './features/collections/contexts/CollectionsContext';

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
                <Route path="/edit-qa/:qaId" element={<PrivateRoute><CreateQA isEditMode={true} /></PrivateRoute>} />
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
