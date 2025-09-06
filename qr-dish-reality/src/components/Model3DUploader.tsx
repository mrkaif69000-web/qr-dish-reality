import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Upload, File, Check, X, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface Model3DUploaderProps {
  onModelUploaded: (modelUrl: string) => void;
  currentModelUrl?: string;
}

const ACCEPTED_FORMATS = ['.glb', '.gltf'];
const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB

export default function Model3DUploader({ onModelUploaded, currentModelUrl }: Model3DUploaderProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const validateFile = (file: File): string | null => {
    const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();
    
    if (!ACCEPTED_FORMATS.includes(fileExtension)) {
      return `Invalid file format. Please upload ${ACCEPTED_FORMATS.join(', ')} files only.`;
    }
    
    if (file.size > MAX_FILE_SIZE) {
      return `File size too large. Please upload files smaller than ${MAX_FILE_SIZE / (1024 * 1024)}MB.`;
    }
    
    return null;
  };

  const uploadFile = async (file: File) => {
    setIsUploading(true);
    setUploadProgress(0);

    try {
      // Generate unique filename
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `3d-models/${fileName}`;

      // Upload to Supabase Storage
      const { data, error } = await supabase.storage
        .from('dish-assets')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false,
        });

      if (error) {
        throw error;
      }

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('dish-assets')
        .getPublicUrl(filePath);

      const modelUrl = urlData.publicUrl;
      onModelUploaded(modelUrl);

      toast({
        title: "3D Model uploaded successfully!",
        description: "Your 3D model is now ready for AR viewing.",
      });

      setUploadProgress(100);
    } catch (error: any) {
      console.error('Upload error:', error);
      toast({
        title: "Upload failed",
        description: error.message || "Failed to upload 3D model. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
      setTimeout(() => setUploadProgress(0), 2000);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDragIn = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(true);
  };

  const handleDragOut = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const handleFileSelect = (file: File) => {
    const error = validateFile(file);
    if (error) {
      toast({
        title: "Invalid file",
        description: error,
        variant: "destructive",
      });
      return;
    }

    uploadFile(file);
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files[0]) {
      handleFileSelect(files[0]);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Upload className="h-5 w-5" />
          3D Model Upload
        </CardTitle>
        <CardDescription>
          Upload a 3D model for AR viewing. Supported formats: {ACCEPTED_FORMATS.join(', ')}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {currentModelUrl && (
          <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
            <Check className="h-4 w-4 text-green-600" />
            <span className="text-sm">3D model is currently set</span>
            <Badge variant="secondary">AR Ready</Badge>
          </div>
        )}

        <div
          onDragEnter={handleDragIn}
          onDragLeave={handleDragOut}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          className={`border-2 border-dashed rounded-lg p-6 transition-colors cursor-pointer ${
            dragActive
              ? 'border-primary bg-primary/5'
              : 'border-muted-foreground/25 hover:border-primary/50'
          }`}
          onClick={triggerFileInput}
        >
          <div className="text-center space-y-4">
            <div className="flex justify-center">
              <File className="h-12 w-12 text-muted-foreground" />
            </div>
            <div>
              <h3 className="font-medium">Drop your 3D model here</h3>
              <p className="text-sm text-muted-foreground">
                or click to browse files
              </p>
            </div>
            <div className="flex flex-wrap justify-center gap-2">
              {ACCEPTED_FORMATS.map((format) => (
                <Badge key={format} variant="outline">
                  {format}
                </Badge>
              ))}
            </div>
          </div>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept={ACCEPTED_FORMATS.join(',')}
          onChange={handleFileInput}
          className="hidden"
        />

        {isUploading && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span>Uploading...</span>
              <span>{uploadProgress}%</span>
            </div>
            <div className="w-full bg-muted rounded-full h-2">
              <div
                className="bg-primary h-2 rounded-full transition-all duration-300"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
          </div>
        )}

        <div className="flex items-start gap-2 p-3 bg-muted/50 rounded-lg">
          <AlertCircle className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
          <div className="text-sm text-muted-foreground">
            <p className="font-medium mb-1">Tips for best results:</p>
            <ul className="list-disc list-inside space-y-1 text-xs">
              <li>Use optimized GLB/GLTF files for faster loading</li>
              <li>Keep file size under 10MB for better performance</li>
              <li>Center your model at origin (0,0,0)</li>
              <li>Use appropriate scale (1-2 units recommended)</li>
            </ul>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}