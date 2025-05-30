import React, { useState } from 'react';
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
  const { toast } = useToast();

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
      formData.append('duration', data.duration || "0:00");
      formData.append('genre', data.genre || "");
      formData.append('track_number', data.trackNumber ? data.trackNumber.toString() : "1");
      formData.append('audio', audioFile);

      const response = await fetch(`/api/albums/${albumId}/tracks`, {
        method: 'POST',
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
      setAudioFile(e.target.files[0]);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add track to {albumTitle}</DialogTitle>
        </DialogHeader>

        {isSubmitting ? (
          <div className="flex flex-col items-center justify-center py-8">
            <Spinner size="lg" className="mb-4" />
            <p className="text-center text-muted-foreground">Uploading track...</p>
          </div>
        ) : (
          <TrackForm 
            initialValues={{
              title: "",
              artist: artist || "",
              trackNumber: "",
              duration: "",
              genre: "",
              comment: ""
            }}
            audioFile={audioFile}
            isSubmitting={isSubmitting}
            handleFileChange={handleFileChange}
            onSubmit={handleSubmit}
            onCancel={() => setOpen(false)}
          />
        )}
      </DialogContent>
    </Dialog>
  );
};

export default AddTrackDialog;
