import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { DataProvider } from './context/DataContext';
import { Layout } from './components/Layout';
import { Dashboard } from './pages/Dashboard';
import { Students } from './pages/Students';
import { FacultyPage } from './pages/Faculty';
import { Admin } from './pages/Admin';
import { Button, Input, Card } from './components/ui/Common';

const LoginPage = () => {
    const { login } = useAuth();
    const [email, setEmail] = useState('admin@university.edu');
    
    return (
        <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
            <Card className="w-full max-w-md">
                <div className="text-center mb-8">
                    <div className="inline-block p-4 rounded-full bg-brand-100 mb-4">
                         <div className="w-8 h-8 bg-brand-600 rounded-lg"></div>
                    </div>
                    <h1 className="text-2xl font-bold text-gray-900">Sign in to AcademiaPro</h1>
                    <p className="text-gray-500">Enterprise Workload Management</p>
                </div>
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                        <Input value={email} onChange={(e: any) => setEmail(e.target.value)} />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                        <Input type="password" value="password" disabled />
                    </div>
                    <Button className="w-full" onClick={() => login(email, 'SUPER_ADMIN')}>Sign In</Button>
                    <div className="text-center text-xs text-gray-400 mt-4">
                        Demo Mode: Any password works. Defaults to Super Admin.
                    </div>
                </div>
            </Card>
        </div>
    );
};

const AppContent = () => {
  const { isAuthenticated } = useAuth();
  const [currentPage, setCurrentPage] = useState('dashboard');

  if (!isAuthenticated) return <LoginPage />;

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard': return <Dashboard />;
      case 'students': return <Students />;
      case 'faculty': return <FacultyPage />;
      case 'admin': return <Admin />;
      default: return <Dashboard />;
    }
  };

  return (
    <Layout currentPage={currentPage} onNavigate={setCurrentPage}>
        {renderPage()}
    </Layout>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <DataProvider>
        <AppContent />
      </DataProvider>
    </AuthProvider>
  );
}
