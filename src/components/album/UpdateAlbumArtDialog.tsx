
import React, { useState } from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { FileImage } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from "@/hooks/use-toast";
import ImageUpload from './components/ImageUpload';

interface UpdateAlbumArtDialogProps {
  albumId: string;
  currentImage: string;
  onImageUpdated: (newImageUrl: string) => void;
}

const UpdateAlbumArtDialog: React.FC<UpdateAlbumArtDialogProps> = ({
  albumId,
  currentImage,
  onImageUpdated
}) => {
  const [open, setOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(currentImage);
  const { toast } = useToast();
  
  // Add form context with useForm hook
  const form = useForm();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImageFile(file);
      
      // Create a preview URL for the image
      const previewUrl = URL.createObjectURL(file);
      setImagePreview(previewUrl);
    }
  };

  const handleSubmit = async () => {
    if (!imageFile) {
      toast({
        title: "Error",
        description: "Please select an image to upload",
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);

    try {
      // Generate a unique filename for storage
      const fileExt = imageFile.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 15)}.${fileExt}`;
      const filePath = `albums/${albumId}/${fileName}`;
      
      console.log('Uploading file to path:', filePath);
      
      // Upload the image file to Supabase Storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('images')
        .upload(filePath, imageFile, {
          cacheControl: '3600',
          upsert: false
        });
      
      if (uploadError) {
        console.error('Upload error:', uploadError);
        throw new Error(`Upload failed: ${uploadError.message}`);
      }
      
      console.log('Upload successful:', uploadData);
      
      // Get the public URL for the uploaded image
      const { data } = supabase.storage
        .from('images')
        .getPublicUrl(filePath);
      
      const publicUrl = data.publicUrl;
      console.log('Public URL:', publicUrl);
      
      // Update the album with the new image URL
      const { error: updateError } = await supabase
        .from('albums')
        .update({ image_url: publicUrl })
        .eq('id', albumId);
      
      if (updateError) {
        console.error('Album update error:', updateError);
        throw new Error(`Album update failed: ${updateError.message}`);
      }
      
      // Call the callback to update the UI
      onImageUpdated(publicUrl);
      
      setOpen(false);
      toast({
        title: "Success",
        description: "Album art updated successfully!",
      });
    } catch (error) {
      console.error("Error updating album art:", error);
      toast({
        title: "Error",
        description: `Failed to update album art: ${error instanceof Error ? error.message : 'Unknown error'}`,
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="flex items-center gap-1" aria-label="Replace Album Art">
          <FileImage size={16} /> Replace Art
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Update Album Art</DialogTitle>
          <DialogDescription>
            Upload a new image for this album.
          </DialogDescription>
        </DialogHeader>
        
        {/* Wrap form components with FormProvider */}
        <FormProvider {...form}>
          <form onSubmit={(e) => {
            e.preventDefault();
            handleSubmit();
          }} className="space-y-4">
            <ImageUpload 
              imagePreview={imagePreview} 
              handleFileChange={handleFileChange} 
            />
            
            <div className="flex justify-end gap-2">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setOpen(false)}
                disabled={isUploading}
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={isUploading || !imageFile}
              >
                {isUploading ? "Uploading..." : "Update Image"}
              </Button>
            </div>
          </form>
        </FormProvider>
      </DialogContent>
    </Dialog>
  );
};

export default UpdateAlbumArtDialog;
