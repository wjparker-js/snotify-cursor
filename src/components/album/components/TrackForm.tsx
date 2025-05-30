
import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from "@/components/ui/button";
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
import AudioUpload from './AudioUpload';
import { trackFormSchema, type TrackFormValues } from '../schemas/trackFormSchema';

// Re-export TrackFormValues type to resolve the import issue in AddTrackDialog
export type { TrackFormValues };

export interface TrackFormProps {
  initialValues: TrackFormValues;
  audioFile: File | null;
  isSubmitting: boolean;
  handleFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSubmit: (values: TrackFormValues) => void;
  onCancel: () => void;
}

const TrackForm: React.FC<TrackFormProps> = ({
  initialValues,
  audioFile,
  isSubmitting,
  handleFileChange,
  onSubmit,
  onCancel
}) => {
  const form = useForm<TrackFormValues>({
    resolver: zodResolver(trackFormSchema),
    defaultValues: initialValues,
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <AudioUpload 
          audioFile={audioFile} 
          handleFileChange={handleFileChange} 
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-xs">Title</FormLabel>
                <FormControl>
                  <Input placeholder="Track title" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="artist"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-xs">Artist</FormLabel>
                <FormControl>
                  <Input placeholder="Artist name" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="trackNumber"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-xs">Track Number</FormLabel>
                <FormControl>
                  <Input 
                    type="number" 
                    placeholder="1" 
                    min="1" 
                    {...field} 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="duration"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-xs">Duration (mm:ss)</FormLabel>
                <FormControl>
                  <Input placeholder="3:45" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="genre"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-xs">Genre (Optional)</FormLabel>
              <FormControl>
                <Input placeholder="Genre" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="comment"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-xs">Comment (Optional)</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Add any additional information about this track"
                  className="resize-none"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end gap-2">
          <Button 
            type="button" 
            variant="outline" 
            onClick={onCancel}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button 
            type="submit"
            disabled={isSubmitting || !audioFile}
          >
            {isSubmitting ? 'Adding Track...' : 'Add Track'}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default TrackForm;
