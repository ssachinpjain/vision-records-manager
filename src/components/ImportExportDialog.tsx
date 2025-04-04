
import React, { useRef, useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { usePatients } from '@/context/PatientContext';
import { FileIcon, UploadIcon, DownloadIcon, InfoIcon } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface ImportExportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const ImportExportDialog: React.FC<ImportExportDialogProps> = ({ open, onOpenChange }) => {
  const { exportToExcel, importFromExcel } = usePatients();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isImporting, setIsImporting] = useState(false);
  const { toast } = useToast();

  const handleExport = () => {
    exportToExcel();
    onOpenChange(false);
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      try {
        setIsImporting(true);
        await importFromExcel(file);
        onOpenChange(false);
      } catch (error) {
        toast({
          title: 'Import failed',
          description: 'There was an error importing the data',
          variant: 'destructive',
        });
        console.error('Import error:', error);
      } finally {
        setIsImporting(false);
        // Reset file input
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      }
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Import/Export Records</DialogTitle>
          <DialogDescription>
            Export your records to Excel or import records from an Excel file.
          </DialogDescription>
        </DialogHeader>
        
        <Alert className="bg-amber-50 border-amber-200 mb-4">
          <InfoIcon className="h-4 w-4 text-amber-500" />
          <AlertDescription className="text-amber-700">
            Due to Excel limitations, prescription images will not be included in exports, but their presence is indicated.
          </AlertDescription>
        </Alert>
        
        <div className="grid gap-6 py-4">
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <Button 
                onClick={handleExport} 
                className="bg-medical-primary hover:bg-medical-dark"
              >
                <DownloadIcon className="mr-2 h-4 w-4" />
                Export Records to Excel
              </Button>
              <p className="text-xs text-muted-foreground">
                Download all your patient records as an Excel file
              </p>
            </div>
            
            <div className="h-px bg-border my-2" />
            
            <div className="flex flex-col gap-2">
              <Button 
                onClick={handleImportClick} 
                variant="outline"
                disabled={isImporting}
              >
                {isImporting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-medical-primary mr-2"></div>
                    Importing...
                  </>
                ) : (
                  <>
                    <UploadIcon className="mr-2 h-4 w-4" />
                    Import Records from Excel
                  </>
                )}
              </Button>
              <p className="text-xs text-muted-foreground">
                Make sure the Excel file follows the correct format
              </p>
              <input 
                type="file" 
                ref={fileInputRef} 
                className="hidden" 
                accept=".xlsx,.xls" 
                onChange={handleFileChange}
              />
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ImportExportDialog;
