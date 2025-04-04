
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import * as XLSX from 'xlsx';

export interface EyeDetails {
  sphere: string;
  cylinder: string;
  axis: string;
  add: string;
}

export interface PatientRecord {
  id: string;
  date: string;
  patientName: string;
  mobileNumber: string;
  rightEye: EyeDetails;
  leftEye: EyeDetails;
  framePrice: string;
  glassPrice: string;
  remarks: string;
  prescriptionImage?: string; // base64 encoded image
}

interface PatientContextType {
  records: PatientRecord[];
  addRecord: (record: Omit<PatientRecord, 'id'>) => void;
  updateRecord: (id: string, record: Omit<PatientRecord, 'id'>) => void;
  deleteRecord: (id: string) => void;
  getRecordById: (id: string) => PatientRecord | undefined;
  searchRecords: (query: string) => PatientRecord[];
  exportToExcel: () => void;
  importFromExcel: (file: File) => Promise<void>;
  isLoading: boolean;
}

const PatientContext = createContext<PatientContextType | undefined>(undefined);

export const PatientProvider: React.FC<{children: React.ReactNode}> = ({ children }) => {
  const [records, setRecords] = useState<PatientRecord[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const { toast } = useToast();

  // Load records from localStorage on mount
  useEffect(() => {
    const loadRecords = () => {
      const savedRecords = localStorage.getItem('patientRecords');
      if (savedRecords) {
        try {
          setRecords(JSON.parse(savedRecords));
        } catch (error) {
          console.error('Failed to parse saved records:', error);
          toast({
            title: 'Error loading records',
            description: 'There was an issue loading your data',
            variant: 'destructive',
          });
        }
      }
      setIsLoading(false);
    };
    loadRecords();
  }, [toast]);

  // Save records to localStorage whenever they change
  useEffect(() => {
    if (!isLoading) {
      localStorage.setItem('patientRecords', JSON.stringify(records));
    }
  }, [records, isLoading]);

  const addRecord = (record: Omit<PatientRecord, 'id'>) => {
    // Check if mobile number is unique
    const existingRecord = records.find(r => r.mobileNumber === record.mobileNumber);
    if (existingRecord) {
      toast({
        title: 'Duplicate mobile number',
        description: 'A record with this mobile number already exists',
        variant: 'destructive',
      });
      return;
    }

    const newRecord: PatientRecord = {
      ...record,
      id: Date.now().toString(),
    };
    
    setRecords(prevRecords => [...prevRecords, newRecord]);
    toast({
      title: 'Record added',
      description: `Patient record for ${record.patientName} has been added`,
    });
  };

  const updateRecord = (id: string, updatedRecord: Omit<PatientRecord, 'id'>) => {
    // Check if mobile number is unique (except for this record)
    const duplicateMobile = records.find(r => r.mobileNumber === updatedRecord.mobileNumber && r.id !== id);
    if (duplicateMobile) {
      toast({
        title: 'Duplicate mobile number',
        description: 'Another record with this mobile number already exists',
        variant: 'destructive',
      });
      return;
    }

    setRecords(prevRecords => 
      prevRecords.map(record => 
        record.id === id ? { ...updatedRecord, id } : record
      )
    );
    toast({
      title: 'Record updated',
      description: `Patient record for ${updatedRecord.patientName} has been updated`,
    });
  };

  const deleteRecord = (id: string) => {
    const recordToDelete = records.find(r => r.id === id);
    if (!recordToDelete) return;

    setRecords(prevRecords => prevRecords.filter(record => record.id !== id));
    toast({
      title: 'Record deleted',
      description: `Patient record for ${recordToDelete.patientName} has been deleted`,
    });
  };

  const getRecordById = (id: string) => {
    return records.find(record => record.id === id);
  };

  const searchRecords = (query: string) => {
    if (!query || query.trim() === '') return records;
    
    const lowerQuery = query.toLowerCase().trim();
    return records.filter(record => 
      record.patientName.toLowerCase().includes(lowerQuery) || 
      record.mobileNumber.includes(lowerQuery)
    );
  };

  const exportToExcel = () => {
    try {
      // Prepare data for export - exclude large images from main export
      const exportData = records.map(record => ({
        Date: record.date,
        'Patient Name': record.patientName,
        'Mobile Number': record.mobileNumber,
        'Right Eye Sphere': record.rightEye.sphere,
        'Right Eye Cylinder': record.rightEye.cylinder,
        'Right Eye Axis': record.rightEye.axis,
        'Right Eye Add': record.rightEye.add,
        'Left Eye Sphere': record.leftEye.sphere,
        'Left Eye Cylinder': record.leftEye.cylinder,
        'Left Eye Axis': record.leftEye.axis,
        'Left Eye Add': record.leftEye.add,
        'Frame Price': record.framePrice,
        'Glass Price': record.glassPrice,
        'Remarks': record.remarks,
        'Has Prescription Image': record.prescriptionImage ? 'Yes' : 'No', // Just indicate if image exists
      }));

      // Create worksheet for main data
      const worksheet = XLSX.utils.json_to_sheet(exportData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Patient Records');
      
      // Generate file name with current date
      const fileName = `DeepakPJain_Records_${new Date().toISOString().split('T')[0]}.xlsx`;

      // Write file and download
      XLSX.writeFile(workbook, fileName);

      toast({
        title: 'Export successful',
        description: 'Patient records exported to Excel. Prescription images are indicated but not included due to size limitations.',
      });
    } catch (error) {
      console.error('Export error:', error);
      toast({
        title: 'Export failed',
        description: 'There was an error exporting the data',
        variant: 'destructive',
      });
    }
  };

  const importFromExcel = async (file: File): Promise<void> => {
    return new Promise((resolve, reject) => {
      try {
        const reader = new FileReader();
        reader.onload = (e) => {
          try {
            const data = new Uint8Array(e.target?.result as ArrayBuffer);
            const workbook = XLSX.read(data, { type: 'array' });
            
            const worksheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[worksheetName];
            
            const jsonData = XLSX.utils.sheet_to_json(worksheet);
            
            const importedRecords: PatientRecord[] = jsonData.map((row: any) => ({
              id: Date.now().toString() + Math.random().toString(36).substring(2, 10),
              date: row['Date'] || '',
              patientName: row['Patient Name'] || '',
              mobileNumber: row['Mobile Number'] || '',
              rightEye: {
                sphere: row['Right Eye Sphere'] || '',
                cylinder: row['Right Eye Cylinder'] || '',
                axis: row['Right Eye Axis'] || '',
                add: row['Right Eye Add'] || '',
              },
              leftEye: {
                sphere: row['Left Eye Sphere'] || '',
                cylinder: row['Left Eye Cylinder'] || '',
                axis: row['Left Eye Axis'] || '',
                add: row['Left Eye Add'] || '',
              },
              framePrice: row['Frame Price'] || '',
              glassPrice: row['Glass Price'] || '',
              remarks: row['Remarks'] || '',
              prescriptionImage: row['Prescription Image'] || '', // Include prescription image when importing
            }));
            
            // Validate mobile numbers are unique
            const existingMobiles = new Set(records.map(r => r.mobileNumber));
            const newMobiles = new Set();
            const validRecords = importedRecords.filter(record => {
              if (!record.mobileNumber || existingMobiles.has(record.mobileNumber) || newMobiles.has(record.mobileNumber)) {
                return false;
              }
              newMobiles.add(record.mobileNumber);
              return true;
            });
            
            setRecords(prev => [...prev, ...validRecords]);
            
            toast({
              title: 'Import successful',
              description: `${validRecords.length} records imported. ${importedRecords.length - validRecords.length} skipped due to missing or duplicate mobile numbers.`,
            });
            
            resolve();
          } catch (error) {
            console.error('Error parsing Excel file:', error);
            toast({
              title: 'Import failed',
              description: 'Error parsing the Excel file',
              variant: 'destructive',
            });
            reject(error);
          }
        };
        
        reader.readAsArrayBuffer(file);
      } catch (error) {
        console.error('Import error:', error);
        toast({
          title: 'Import failed',
          description: 'There was an error importing the data',
          variant: 'destructive',
        });
        reject(error);
      }
    });
  };

  return (
    <PatientContext.Provider 
      value={{ 
        records, 
        addRecord, 
        updateRecord, 
        deleteRecord, 
        getRecordById, 
        searchRecords,
        exportToExcel,
        importFromExcel,
        isLoading 
      }}
    >
      {children}
    </PatientContext.Provider>
  );
};

export const usePatients = () => {
  const context = useContext(PatientContext);
  if (context === undefined) {
    throw new Error('usePatients must be used within a PatientProvider');
  }
  return context;
};
