import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeftIcon, CameraIcon, FileIcon, Trash2Icon, LayoutDashboardIcon } from 'lucide-react';
import { usePatients, PatientRecord, EyeDetails } from '@/context/PatientContext';
import ImageUploadPreview from '@/components/ImageUploadPreview';
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/context/AuthContext';

interface EyeInputProps {
  label: string;
  values: EyeDetails;
  onChange: (values: EyeDetails) => void;
}

const EyeInputGroup: React.FC<EyeInputProps> = ({ label, values, onChange }) => {
  const handleChange = (field: keyof EyeDetails, value: string) => {
    onChange({ ...values, [field]: value });
  };

  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <div className="grid grid-cols-4 gap-2">
        <div>
          <Label htmlFor={`${label.toLowerCase()}-sphere`} className="text-xs">SPH</Label>
          <Input 
            id={`${label.toLowerCase()}-sphere`}
            value={values.sphere}
            onChange={(e) => handleChange('sphere', e.target.value)}
            className="eye-input-field"
          />
        </div>
        <div>
          <Label htmlFor={`${label.toLowerCase()}-cylinder`} className="text-xs">CYL</Label>
          <Input 
            id={`${label.toLowerCase()}-cylinder`}
            value={values.cylinder}
            onChange={(e) => handleChange('cylinder', e.target.value)}
            className="eye-input-field"
          />
        </div>
        <div>
          <Label htmlFor={`${label.toLowerCase()}-axis`} className="text-xs">AXIS</Label>
          <Input 
            id={`${label.toLowerCase()}-axis`}
            value={values.axis}
            onChange={(e) => handleChange('axis', e.target.value)}
            className="eye-input-field"
          />
        </div>
        <div>
          <Label htmlFor={`${label.toLowerCase()}-add`} className="text-xs">ADD</Label>
          <Input 
            id={`${label.toLowerCase()}-add`}
            value={values.add}
            onChange={(e) => handleChange('add', e.target.value)}
            className="eye-input-field"
          />
        </div>
      </div>
    </div>
  );
};

const RecordForm = () => {
  const { id } = useParams();
  const isEditMode = !!id;
  const navigate = useNavigate();
  const { addRecord, updateRecord, deleteRecord, getRecordById } = usePatients();
  const { toast } = useToast();
  const { logout } = useAuth();

  const [formData, setFormData] = useState<Omit<PatientRecord, 'id'>>({
    date: format(new Date(), 'yyyy-MM-dd'),
    patientName: '',
    mobileNumber: '',
    rightEye: { sphere: '', cylinder: '', axis: '', add: '' },
    leftEye: { sphere: '', cylinder: '', axis: '', add: '' },
    framePrice: '',
    glassPrice: '',
    remarks: '',
  });

  const [prescriptionImage, setPrescriptionImage] = useState<string | undefined>(undefined);

  useEffect(() => {
    if (isEditMode && id) {
      const record = getRecordById(id);
      if (record) {
        setFormData({
          date: record.date,
          patientName: record.patientName,
          mobileNumber: record.mobileNumber,
          rightEye: { ...record.rightEye },
          leftEye: { ...record.leftEye },
          framePrice: record.framePrice,
          glassPrice: record.glassPrice,
          remarks: record.remarks,
        });
        setPrescriptionImage(record.prescriptionImage);
      } else {
        toast({
          title: 'Record not found',
          description: 'The requested record could not be found',
          variant: 'destructive',
        });
        navigate('/');
      }
    }
  }, [isEditMode, id, getRecordById, navigate, toast]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleRightEyeChange = (values: EyeDetails) => {
    setFormData(prev => ({ ...prev, rightEye: values }));
  };

  const handleLeftEyeChange = (values: EyeDetails) => {
    setFormData(prev => ({ ...prev, leftEye: values }));
  };

  const handleImageSelect = (imageData: string) => {
    setPrescriptionImage(imageData);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.date || !formData.patientName || !formData.mobileNumber || !formData.remarks) {
      toast({
        title: 'Missing required fields',
        description: 'Please fill in all required fields (Date, Patient Name, Mobile Number, and Remarks)',
        variant: 'destructive',
      });
      return;
    }

    const completeRecord = {
      ...formData,
      prescriptionImage,
    };

    if (isEditMode && id) {
      updateRecord(id, completeRecord);
    } else {
      addRecord(completeRecord);
    }
    
    navigate('/');
  };

  const handleDelete = () => {
    if (isEditMode && id && confirm('Are you sure you want to delete this record?')) {
      deleteRecord(id);
      navigate('/');
    }
  };

  return (
    <div className="container max-w-3xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          {isEditMode && (
            <Button variant="ghost" onClick={() => navigate('/')} className="mr-2">
              <ArrowLeftIcon className="h-4 w-4" />
            </Button>
          )}
          <h1 className="text-2xl font-bold">{isEditMode ? 'Edit Patient Record' : 'Add New Patient Record'}</h1>
        </div>
        <div className="flex space-x-2">
          <Button 
            variant="outline" 
            onClick={() => navigate('/dashboard')}
            className="flex items-center gap-1"
          >
            <LayoutDashboardIcon className="h-4 w-4" />
            Dashboard
          </Button>
          <Button 
            variant="secondary" 
            onClick={logout}
            className="text-sm"
          >
            Logout
          </Button>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Patient Information</CardTitle>
            <CardDescription>Enter the basic details of the patient</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="date" className="after:content-['*'] after:text-destructive after:ml-0.5">Date</Label>
              <Input
                id="date"
                name="date"
                type="date"
                value={formData.date}
                onChange={handleInputChange}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="patientName" className="after:content-['*'] after:text-destructive after:ml-0.5">Patient Name</Label>
              <Input
                id="patientName"
                name="patientName"
                value={formData.patientName}
                onChange={handleInputChange}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="mobileNumber" className="after:content-['*'] after:text-destructive after:ml-0.5">Mobile Number</Label>
              <Input
                id="mobileNumber"
                name="mobileNumber"
                type="tel"
                value={formData.mobileNumber}
                onChange={handleInputChange}
                required
              />
            </div>
          </CardContent>
        </Card>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Eye Examination Details</CardTitle>
            <CardDescription>Enter the vision examination results</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <EyeInputGroup 
              label="Right Eye" 
              values={formData.rightEye} 
              onChange={handleRightEyeChange} 
            />

            <EyeInputGroup 
              label="Left Eye" 
              values={formData.leftEye} 
              onChange={handleLeftEyeChange} 
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="framePrice">Frame Price</Label>
                <Input
                  id="framePrice"
                  name="framePrice"
                  type="number"
                  min="0"
                  value={formData.framePrice}
                  onChange={handleInputChange}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="glassPrice">Glass Price</Label>
                <Input
                  id="glassPrice"
                  name="glassPrice"
                  type="number"
                  min="0"
                  value={formData.glassPrice}
                  onChange={handleInputChange}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Prescription Image</CardTitle>
            <CardDescription>Upload or take a picture of the prescription</CardDescription>
          </CardHeader>
          <CardContent>
            <ImageUploadPreview 
              initialImage={prescriptionImage} 
              onImageSelect={handleImageSelect}
            />
          </CardContent>
        </Card>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Additional Information</CardTitle>
            <CardDescription>Add any additional notes or remarks</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Label htmlFor="remarks" className="after:content-['*'] after:text-destructive after:ml-0.5">Remarks</Label>
              <Textarea
                id="remarks"
                name="remarks"
                rows={3}
                value={formData.remarks}
                onChange={handleInputChange}
                required
              />
            </div>
          </CardContent>
          <CardFooter className="flex flex-col sm:flex-row gap-3">
            <Button 
              type="submit" 
              className="bg-medical-primary hover:bg-medical-dark w-full sm:w-auto"
            >
              {isEditMode ? 'Update Record' : 'Save Record'}
            </Button>
            
            {isEditMode && (
              <Button 
                type="button" 
                variant="destructive" 
                onClick={handleDelete}
                className="w-full sm:w-auto"
              >
                <Trash2Icon className="mr-2 h-4 w-4" />
                Delete Record
              </Button>
            )}
            
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => navigate('/')}
              className="w-full sm:w-auto"
            >
              Cancel
            </Button>
          </CardFooter>
        </Card>
      </form>
    </div>
  );
};

export default RecordForm;
