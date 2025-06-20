import React, { useEffect, forwardRef, useImperativeHandle } from 'react';
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

export interface TrackFormRef {
  updateTitle: (title: string) => void;
}

const TrackForm = forwardRef<TrackFormRef, TrackFormProps>(({
  initialValues,
  audioFile,
  isSubmitting,
  handleFileChange,
  onSubmit,
  onCancel
}, ref) => {
  const form = useForm<TrackFormValues>({
    resolver: zodResolver(trackFormSchema),
    defaultValues: initialValues,
  });

  // Expose methods to parent component
  useImperativeHandle(ref, () => ({
    updateTitle: (title: string) => {
      form.setValue('title', title);
    }
  }));

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3">
        <AudioUpload 
          audioFile={audioFile} 
          handleFileChange={handleFileChange} 
        />

        <div className="grid grid-cols-2 gap-3">
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-xs font-medium">Title</FormLabel>
                <FormControl>
                  <Input placeholder="Track title" className="h-8" {...field} />
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
                <FormLabel className="text-xs font-medium">Artist</FormLabel>
                <FormControl>
                  <Input placeholder="Artist name" className="h-8" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <FormField
            control={form.control}
            name="trackNumber"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-xs font-medium">Track #</FormLabel>
                <FormControl>
                  <Input 
                    type="number" 
                    placeholder="1" 
                    min="1" 
                    className="h-8"
                    {...field} 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="genre"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-xs font-medium">Genre</FormLabel>
                <FormControl>
                  <Input placeholder="Genre" className="h-8" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="comment"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-xs font-medium">Comment (Optional)</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Additional information"
                  className="resize-none h-16 text-sm"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end gap-2 pt-2">
          <Button 
            type="button" 
            variant="outline" 
            size="sm"
            onClick={onCancel}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button 
            type="submit"
            size="sm"
            disabled={isSubmitting || !audioFile}
          >
            {isSubmitting ? 'Adding...' : 'Add Track'}
          </Button>
        </div>
      </form>
    </Form>
  );
});

TrackForm.displayName = 'TrackForm';

export default TrackForm;
