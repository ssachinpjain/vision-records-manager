
import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { CameraIcon, FileIcon, TrashIcon, UploadIcon } from 'lucide-react';

interface ImageUploadPreviewProps {
  initialImage?: string;
  onImageSelect: (imageData: string | undefined) => void;
}

const ImageUploadPreview: React.FC<ImageUploadPreviewProps> = ({ initialImage, onImageSelect }) => {
  const [image, setImage] = useState<string | undefined>(initialImage);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        setImage(result);
        onImageSelect(result);
      };
      reader.readAsDataURL(file);
    }
  };

  const takePhoto = async () => {
    try {
      // Check if getUserMedia is supported
      if (!navigator.mediaDevices?.getUserMedia) {
        alert('Camera access is not supported by this browser');
        return;
      }

      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      
      const video = document.createElement('video');
      video.srcObject = stream;
      
      // We need to wait for the video to be loaded
      await new Promise<void>((resolve) => {
        video.onloadedmetadata = () => {
          video.play();
          resolve();
        };
      });
      
      // Create a canvas to capture the image
      const canvas = document.createElement('canvas');
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      const context = canvas.getContext('2d');
      if (context) {
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        
        // Get the image data
        const imageData = canvas.toDataURL('image/jpeg');
        setImage(imageData);
        onImageSelect(imageData);
      }
      
      // Stop all video streams
      stream.getTracks().forEach(track => track.stop());
      
    } catch (err) {
      console.error('Error accessing camera:', err);
      alert('Unable to access the camera. Please check your permissions.');
    }
  };

  const removeImage = () => {
    setImage(undefined);
    onImageSelect(undefined);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-4">
      {image ? (
        <div className="relative">
          <img 
            src={image} 
            alt="Prescription" 
            className="w-full h-auto rounded-md object-cover max-h-80"
          />
          <Button 
            variant="destructive" 
            size="sm"
            className="absolute top-2 right-2 rounded-full"
            onClick={removeImage}
          >
            <TrashIcon className="h-4 w-4" />
          </Button>
        </div>
      ) : (
        <div className="border-2 border-dashed rounded-md p-8 text-center bg-muted">
          <FileIcon className="h-10 w-10 mx-auto text-muted-foreground mb-2" />
          <p className="text-sm text-muted-foreground mb-4">
            Upload prescription image or take a photo
          </p>
          <div className="flex flex-col sm:flex-row gap-2 justify-center">
            <Button 
              variant="outline" 
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-2"
            >
              <UploadIcon className="h-4 w-4" />
              Upload File
            </Button>
            <Button 
              variant="outline"
              onClick={takePhoto}
              className="flex items-center gap-2"
            >
              <CameraIcon className="h-4 w-4" />
              Take Photo
            </Button>
          </div>
        </div>
      )}
      
      <input 
        type="file" 
        ref={fileInputRef}
        accept="image/*" 
        className="hidden" 
        onChange={handleFileChange}
      />
    </div>
  );
};

export default ImageUploadPreview;
