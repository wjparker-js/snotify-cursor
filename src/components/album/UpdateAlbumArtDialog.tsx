import React, { useState, useRef } from 'react';
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
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImageFile(file);
      const previewUrl = URL.createObjectURL(file);
      setImagePreview(previewUrl);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleDialogClose = (open: boolean) => {
    setOpen(open);
    if (!open) {
      setImageFile(null);
      setImagePreview(currentImage);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
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
      const formData = new FormData();
      formData.append('cover', imageFile);
      const response = await fetch(`http://localhost:4000/api/albums/${albumId}/cover`, {
        method: 'POST',
        body: formData,
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to upload album cover');
      }
      toast({
        title: "Success",
        description: "Album art updated successfully!",
      });
      setOpen(false);
      onImageUpdated(`${currentImage.split('?')[0]}?${Date.now()}`); // force reload
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update album art.",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleDialogClose}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="flex items-center gap-1" aria-label="Upload/Change Cover">
          <FileImage size={16} /> Upload/Change Cover
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Update Album Art</DialogTitle>
          <DialogDescription>
            Upload a new image for this album.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <ImageUpload
            imagePreview={imagePreview}
            handleFileChange={handleFileChange}
            inputRef={fileInputRef}
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
      </DialogContent>
    </Dialog>
  );
};

export default UpdateAlbumArtDialog;
