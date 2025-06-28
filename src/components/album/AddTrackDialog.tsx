import React, { useState, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { useToast } from "@/hooks/use-toast";
import TrackForm, { TrackFormValues } from './components/TrackForm';

interface AddTrackDialogProps {
  children: React.ReactNode;
  albumId: string;
  albumTitle?: string;
  artist?: string;
}

const AddTrackDialog: React.FC<AddTrackDialogProps> = ({
  children,
  albumId,
  albumTitle,
  artist
}) => {
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const trackFormRef = useRef<{ updateTitle: (title: string) => void }>(null);
  const { toast } = useToast();

  // Function to extract filename without extension
  const getFilenameWithoutExtension = (filename: string): string => {
    return filename.replace(/\.[^/.]+$/, "");
  };

  const handleSubmit = async (data: TrackFormValues) => {
    if (!audioFile) {
      toast({
        title: "Error",
        description: "Please select an audio file",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('title', data.title);
      formData.append('artist', data.artist || artist || "");
      formData.append('genre', data.genre || "");
      formData.append('track_number', data.trackNumber ? data.trackNumber.toString() : "1");
      formData.append('audio', audioFile);

      const response = await fetch(`http://localhost:4000/api/albums/${albumId}/tracks`, {
        method: 'POST',
        headers: {
          'ngrok-skip-browser-warning': 'true'
        },
        body: formData
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to add track');
      }

      toast({
        title: "Success",
        description: "Track added successfully"
      });
      setOpen(false);
      // Reset form
      setAudioFile(null);
    } catch (error: any) {
      console.error('Error adding track:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to add track. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      setAudioFile(file);
      
      // Auto-fill the title with filename (without extension)
      const titleFromFilename = getFilenameWithoutExtension(file.name);
      if (trackFormRef.current) {
        trackFormRef.current.updateTitle(titleFromFilename);
      }
    }
  };

  const handleCancel = () => {
    setOpen(false);
    setAudioFile(null);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[420px] max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-lg">Add Track to {albumTitle}</DialogTitle>
        </DialogHeader>

        {isSubmitting ? (
          <div className="flex flex-col items-center justify-center py-6">
            <Spinner size="lg" className="mb-4" />
            <p className="text-center text-muted-foreground">Uploading track...</p>
          </div>
        ) : (
          <TrackForm 
            ref={trackFormRef}
            initialValues={{
              title: "",
              artist: artist || "",
              trackNumber: "",
              genre: "",
              comment: ""
            }}
            audioFile={audioFile}
            isSubmitting={isSubmitting}
            handleFileChange={handleFileChange}
            onSubmit={handleSubmit}
            onCancel={handleCancel}
          />
        )}
      </DialogContent>
    </Dialog>
  );
};

export default AddTrackDialog;
