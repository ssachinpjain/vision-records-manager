
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Search, UserPlus, FileSpreadsheet, LogOut } from 'lucide-react';
import { usePatients } from '@/context/PatientContext';
import { useNavigate } from 'react-router-dom';
import PatientCard from '@/components/PatientCard';
import { useAuth } from '@/context/AuthContext';
import ImportExportDialog from '@/components/ImportExportDialog';
import { useToast } from '@/hooks/use-toast';

const Dashboard = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const { records, searchRecords, isLoading } = usePatients();
  const { logout } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const filteredRecords = searchRecords(searchQuery);

  const handleAddNew = () => {
    navigate('/add-record');
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  return (
    <div className="container max-w-6xl mx-auto px-4 py-8">
      <header className="flex flex-col md:flex-row justify-between items-center mb-8">
        <div className="logo-text mb-4 md:mb-0">DEEPAK P JAIN</div>
        <div className="flex space-x-2">
          <Button 
            variant="outline" 
            className="flex items-center gap-2 border-medical-primary text-medical-primary" 
            onClick={() => setDialogOpen(true)}
          >
            <FileSpreadsheet className="h-4 w-4" />
            <span className="hidden sm:inline">Import/Export</span>
          </Button>
          <Button 
            variant="outline" 
            className="flex items-center gap-2 border-destructive text-destructive" 
            onClick={logout}
          >
            <LogOut className="h-4 w-4" />
            <span className="hidden sm:inline">Logout</span>
          </Button>
        </div>
      </header>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Vision Records</CardTitle>
          <CardDescription>Manage your patient's vision examination records</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 items-center">
            <div className="relative flex-1 w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input 
                placeholder="Search by name or mobile number" 
                className="pl-9"
                value={searchQuery}
                onChange={handleSearchChange}
              />
            </div>
            <Button onClick={handleAddNew} className="bg-medical-primary hover:bg-medical-dark w-full sm:w-auto">
              <UserPlus className="mr-2 h-4 w-4" />
              Add New Record
            </Button>
          </div>
        </CardContent>
      </Card>

      {isLoading ? (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-medical-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading records...</p>
        </div>
      ) : filteredRecords.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredRecords.map(record => (
            <PatientCard key={record.id} patient={record} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-muted-foreground">
            {searchQuery ? 'No records match your search' : 'No patient records found'}
          </p>
          {!searchQuery && (
            <Button onClick={handleAddNew} className="mt-4 bg-medical-primary hover:bg-medical-dark">
              <UserPlus className="mr-2 h-4 w-4" />
              Add Your First Record
            </Button>
          )}
        </div>
      )}
      
      <ImportExportDialog open={dialogOpen} onOpenChange={setDialogOpen} />
    </div>
  );
};

export default Dashboard;
