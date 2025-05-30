
import * as z from 'zod';

// Form validation schema
export const albumFormSchema = z.object({
  title: z.string().min(1, "Title is required"),
  artist: z.string().min(1, "Artist is required"),
  genre: z.string().optional(),
  year: z.string().optional(),
  comments: z.string().optional(),
});

export type AlbumFormValues = z.infer<typeof albumFormSchema>;
