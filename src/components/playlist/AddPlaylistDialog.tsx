import React, { useState, useRef } from 'react';
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
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Upload, ImageIcon } from 'lucide-react';
import * as z from 'zod';
import { getApiUrl } from '@/lib/config';

const playlistFormSchema = z.object({
  name: z.string().min(1, 'Playlist name is required').max(100, 'Playlist name must be 100 characters or less'),
  description: z.string().max(500, 'Description must be 500 characters or less').optional(),
});

type PlaylistFormValues = z.infer<typeof playlistFormSchema>;

interface AddPlaylistDialogProps {
  children?: React.ReactNode;
  onPlaylistAdded?: () => void;
}

const AddPlaylistDialog: React.FC<AddPlaylistDialogProps> = ({ children, onPlaylistAdded }) => {
  const [open, setOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const { toast } = useToast();
  const imageInputRef = useRef<HTMLInputElement>(null);

  const form = useForm<PlaylistFormValues>({
    resolver: zodResolver(playlistFormSchema),
    defaultValues: {
      name: "",
      description: "",
    },
  });

  const handleDialogClose = (open: boolean) => {
    setOpen(open);
    if (!open) {
      form.reset();
      setImagePreview(null);
      setSelectedImage(null);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onload = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleImageClick = () => {
    imageInputRef.current?.click();
  };

  const onSubmit = async (data: PlaylistFormValues) => {
    setIsCreating(true);
    try {
      const formData = new FormData();
      formData.append('name', data.name.trim());
      formData.append('description', data.description?.trim() || '');
      
      if (selectedImage) {
        formData.append('image', selectedImage);
      }

      const token = localStorage.getItem('jwt');
      if (!token) {
        throw new Error('Authentication required to create playlist');
      }

      const response = await fetch(getApiUrl('/api/playlists'), {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'ngrok-skip-browser-warning': 'true',
        },
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create playlist');
      }

      const playlist = await response.json();

      toast({
        title: "Success",
        description: "Playlist created successfully!",
        variant: "default",
      });

      if (onPlaylistAdded) onPlaylistAdded();
      form.reset();
      setImagePreview(null);
      setSelectedImage(null);
      setOpen(false);
    } catch (error: any) {
      console.error("Error creating playlist:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to create playlist. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleDialogClose}>
      <DialogTrigger asChild>
        {children || (
          <Button className="gap-2" size="sm">
            <Plus size={16} />
            Add Playlist
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="w-[500px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Playlist</DialogTitle>
          <DialogDescription>
            Give your playlist a name, optionally add a description and cover image.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Playlist Name *</FormLabel>
                  <FormControl>
                    <Input 
                      {...field} 
                      placeholder="Enter playlist name"
                      disabled={isCreating}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            {/* Image Upload Section */}
            <div className="space-y-2">
              <FormLabel>Playlist Cover (Optional)</FormLabel>
              <div className="flex gap-4">
                <div
                  className="flex items-center justify-center border-2 border-dashed border-gray-600 rounded-md w-32 h-32 relative overflow-hidden cursor-pointer bg-gray-900 hover:border-primary transition-colors"
                  onClick={handleImageClick}
                >
                  <input
                    ref={imageInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="absolute inset-0 opacity-0 cursor-pointer z-10 w-full h-full"
                    disabled={isCreating}
                  />
                  <div className="flex flex-col items-center justify-center pointer-events-none select-none">
                    <Upload className="w-6 h-6 text-gray-500" />
                    <span className="mt-2 text-xs text-gray-500 text-center">Click to upload</span>
                  </div>
                </div>
                
                <div className="flex flex-col items-center justify-center">
                  <span className="text-xs mb-1 block text-gray-400">Preview</span>
                  {imagePreview ? (
                    <div className="relative w-32 h-32 overflow-hidden rounded-md border border-gray-700 bg-gray-900">
                      <img
                        src={imagePreview}
                        alt="Playlist preview"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center w-32 h-32 bg-gray-800 rounded-md border border-gray-700">
                      <ImageIcon className="w-8 h-8 text-gray-400" />
                      <span className="mt-2 text-xs text-gray-400 text-center">No image</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description (Optional)</FormLabel>
                  <FormControl>
                    <Textarea 
                      {...field} 
                      placeholder="Describe your playlist..."
                      disabled={isCreating}
                      rows={3}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex justify-end gap-2 pt-4">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setOpen(false)}
                disabled={isCreating}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isCreating}>
                {isCreating ? "Creating..." : "Create Playlist"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default AddPlaylistDialog;
