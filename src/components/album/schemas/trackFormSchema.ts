
import * as z from 'zod';

// Form validation schema for tracks
export const trackFormSchema = z.object({
  title: z.string().min(1, "Title is required"),
  artist: z.string().min(1, "Artist is required"),
  trackNumber: z.string().optional(),
  duration: z.string().optional(),
  genre: z.string().optional(),
  comment: z.string().optional(),
});

export type TrackFormValues = z.infer<typeof trackFormSchema>;
