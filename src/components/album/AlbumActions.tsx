import React, { useState } from 'react';
import { Heart, MoreHorizontal, Trash2, FileImage } from 'lucide-react';
import AddTrackDialog from './AddTrackDialog';
import { Track } from '@/types/supabase';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';
import { Button } from '@/components/ui/button';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';

interface AlbumActionsProps {
  albumId?: string;
  albumTitle?: string;
  artist?: string;
  updateAlbumArtDialog?: React.ReactNode;
  onDeleteAlbum?: () => void;
  onTrackAdded?: (track: Track) => void;
}

const ADMIN_EMAILS = ["wjparker@outlook.com", "ghodgett59@gmail.com"];

const AlbumActions: React.FC<AlbumActionsProps> = ({
  albumId,
  albumTitle,
  artist,
  updateAlbumArtDialog,
  onDeleteAlbum,
  onTrackAdded
}) => {
  const { user } = useAuth();
  const { colorTheme } = useTheme();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const isAdmin = user && ADMIN_EMAILS.includes(user.email ?? "");

  const handleDeleteClick = () => {
    if (onDeleteAlbum) {
      onDeleteAlbum();
    }
    setDeleteDialogOpen(false);
  };

  return (
    <div className="flex items-center gap-4 mt-4 mb-6">
      {albumId && (
        <>
          <AddTrackDialog 
            albumId={albumId} 
            albumTitle={albumTitle}
            artist={artist}
          >
            <Button 
              size="sm" 
              className="flex items-center gap-1"
              aria-label="Add Track"
            >
              Add Track
            </Button>
          </AddTrackDialog>
          {updateAlbumArtDialog}
          {onDeleteAlbum && (
            <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
              <AlertDialogTrigger asChild>
                <Button 
                  variant="destructive"
                  size="sm" 
                  className="flex items-center gap-1"
                  aria-label="Delete Album"
                >
                  <Trash2 size={16} /> Delete Album
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete Album</AlertDialogTitle>
                  <AlertDialogDescription>
                    Are you sure you want to delete this album? This will permanently remove all tracks and audio files.
                    This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handleDeleteClick} className="bg-red-600 hover:bg-red-700">
                    Delete
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
        </>
      )}
    </div>
  );
};

export default AlbumActions;
