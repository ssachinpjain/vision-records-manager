
import React from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CalendarIcon, EditIcon, PhoneIcon, UserIcon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { PatientRecord } from '@/context/PatientContext';

interface PatientCardProps {
  patient: PatientRecord;
}

const PatientCard: React.FC<PatientCardProps> = ({ patient }) => {
  const navigate = useNavigate();

  const handleEdit = () => {
    navigate(`/edit-record/${patient.id}`);
  };

  return (
    <Card className="overflow-hidden hover:shadow-md transition-shadow duration-300">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-lg">{patient.patientName}</CardTitle>
            <CardDescription className="flex items-center mt-1">
              <PhoneIcon className="h-3 w-3 mr-1" />
              {patient.mobileNumber}
            </CardDescription>
          </div>
          {patient.prescriptionImage && (
            <div className="flex-shrink-0">
              <div className="h-12 w-12 rounded-md bg-muted overflow-hidden">
                <img 
                  src={patient.prescriptionImage} 
                  alt="Prescription" 
                  className="h-full w-full object-cover"
                />
              </div>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent className="pb-2">
        <div className="flex items-center text-xs text-muted-foreground mb-2">
          <CalendarIcon className="h-3 w-3 mr-1" />
          {patient.date}
        </div>
        
        <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm mt-2">
          <div>
            <span className="font-medium text-xs">R Eye:</span>{' '}
            <span className="text-xs">
              {patient.rightEye.sphere ? `S${patient.rightEye.sphere}` : '-'}{' '}
              {patient.rightEye.cylinder ? `C${patient.rightEye.cylinder}` : ''}{' '}
              {patient.rightEye.axis ? `A${patient.rightEye.axis}` : ''}{' '}
              {patient.rightEye.add ? `Add${patient.rightEye.add}` : ''}
            </span>
          </div>
          
          <div>
            <span className="font-medium text-xs">L Eye:</span>{' '}
            <span className="text-xs">
              {patient.leftEye.sphere ? `S${patient.leftEye.sphere}` : '-'}{' '}
              {patient.leftEye.cylinder ? `C${patient.leftEye.cylinder}` : ''}{' '}
              {patient.leftEye.axis ? `A${patient.leftEye.axis}` : ''}{' '}
              {patient.leftEye.add ? `Add${patient.leftEye.add}` : ''}
            </span>
          </div>
          
          {(patient.framePrice || patient.glassPrice) && (
            <>
              <div>
                <span className="font-medium text-xs">Frame:</span>{' '}
                <span className="text-xs">₹{patient.framePrice || '-'}</span>
              </div>
              
              <div>
                <span className="font-medium text-xs">Glass:</span>{' '}
                <span className="text-xs">₹{patient.glassPrice || '-'}</span>
              </div>
            </>
          )}
        </div>
        
        <p className="text-xs mt-2 line-clamp-2 text-muted-foreground">
          {patient.remarks}
        </p>
      </CardContent>
      <CardFooter className="pt-2">
        <Button 
          variant="outline"
          size="sm"
          className="w-full text-xs border-medical-primary text-medical-primary"
          onClick={handleEdit}
        >
          <EditIcon className="h-3 w-3 mr-1" /> View & Edit
        </Button>
      </CardFooter>
    </Card>
  );
};

export default PatientCard;
