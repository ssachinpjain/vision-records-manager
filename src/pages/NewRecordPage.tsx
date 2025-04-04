
import React from 'react';
import { Navigate } from 'react-router-dom';
import RecordForm from './RecordForm';
import { useAuth } from '@/context/AuthContext';

const NewRecordPage = () => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-medical-primary"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  return <RecordForm />;
};

export default NewRecordPage;
