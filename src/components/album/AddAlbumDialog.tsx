import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Upload } from 'lucide-react';
import { albumFormSchema, AlbumFormValues } from './schemas/albumFormSchema';
import AlbumForm from './components/AlbumForm';

interface AddAlbumDialogProps {
  children?: React.ReactNode;
  onAlbumAdded?: () => void;
}

const AddAlbumDialog: React.FC<AddAlbumDialogProps> = ({ children, onAlbumAdded }) => {
  const [open, setOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const { toast } = useToast();

  const form = useForm<AlbumFormValues>({
    resolver: zodResolver(albumFormSchema),
    defaultValues: {
      title: "",
      artist: "",
      genre: "",
      year: "",
      comments: "",
    },
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImageFile(file);
      const previewUrl = URL.createObjectURL(file);
      setImagePreview(previewUrl);
    }
  };

  const onSubmit = async (data: AlbumFormValues) => {
    if (!imageFile) {
      toast({
        title: "Error",
        description: "Please upload an album cover image",
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append('title', data.title);
      formData.append('artist', data.artist);
      formData.append('year', data.year || '');
      formData.append('track_count', '0');
      formData.append('duration', '0:00');
      formData.append('image', imageFile);
      // Add genre/comments if your backend supports them

      const response = await fetch('/api/albums', {
        method: 'POST',
        body: formData
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to add album');
      }

      toast({
        title: "Success",
        description: "Album added successfully!",
        variant: "default",
      });
      if (onAlbumAdded) onAlbumAdded();
      form.reset();
      setImageFile(null);
      setImagePreview(null);
      setOpen(false);
    } catch (error: any) {
      console.error("Error adding album:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to add album. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children || (
          <Button className="gap-2" size="sm">
            <Upload size={16} />
            Add Album
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="w-[400px] h-[530px] overflow-hidden py-6 px-6 text-xs">
        <DialogHeader className="py-1">
          <DialogTitle className="text-base">Add New Album</DialogTitle>
          <DialogDescription className="text-xs">
            Upload an album cover and fill in the details below.
          </DialogDescription>
        </DialogHeader>
        <AlbumForm
          form={form}
          isUploading={isUploading}
          imagePreview={imagePreview}
          handleFileChange={handleFileChange}
          onSubmit={onSubmit}
          onCancel={() => setOpen(false)}
        />
      </DialogContent>
    </Dialog>
  );
};

export default AddAlbumDialog;
