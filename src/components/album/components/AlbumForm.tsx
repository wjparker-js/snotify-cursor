import React from 'react';
import { UseFormReturn } from 'react-hook-form';
import { AlbumFormValues } from '../schemas/albumFormSchema';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { DialogFooter } from "@/components/ui/dialog";
import ImageUpload from './ImageUpload';

interface AlbumFormProps {
  form: UseFormReturn<AlbumFormValues>;
  isUploading: boolean;
  imagePreview: string | null;
  handleFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSubmit: (data: AlbumFormValues) => void;
  onCancel: () => void;
}

const AlbumForm: React.FC<AlbumFormProps> = ({
  form,
  isUploading,
  imagePreview,
  handleFileChange,
  onSubmit,
  onCancel,
}) => {
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3 text-xs">
        <ImageUpload 
          imagePreview={imagePreview} 
          handleFileChange={handleFileChange} 
        />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem className="space-y-1">
                <FormLabel className="text-xs">Title</FormLabel>
                <FormControl>
                  <Input placeholder="Album title" {...field} className="h-7 text-xs" />
                </FormControl>
                <FormMessage className="text-xs" />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="artist"
            render={({ field }) => (
              <FormItem className="space-y-1">
                <FormLabel className="text-xs">Artist</FormLabel>
                <FormControl>
                  <Input placeholder="Artist name" {...field} className="h-7 text-xs" />
                </FormControl>
                <FormMessage className="text-xs" />
              </FormItem>
            )}
          />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          <FormField
            control={form.control}
            name="genre"
            render={({ field }) => (
              <FormItem className="space-y-1">
                <FormLabel className="text-xs">Genre</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger className="h-7 text-xs">
                      <SelectValue placeholder="Select genre" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="rock">Rock</SelectItem>
                    <SelectItem value="pop">Pop</SelectItem>
                    <SelectItem value="jazz">Jazz</SelectItem>
                    <SelectItem value="classical">Classical</SelectItem>
                    <SelectItem value="hip-hop">Hip Hop</SelectItem>
                    <SelectItem value="electronic">Electronic</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage className="text-xs" />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="year"
            render={({ field }) => (
              <FormItem className="space-y-1">
                <FormLabel className="text-xs">Year</FormLabel>
                <FormControl>
                  <Input placeholder="Release year" {...field} className="h-7 text-xs" />
                </FormControl>
                <FormMessage className="text-xs" />
              </FormItem>
            )}
          />
        </div>
        <FormField
          control={form.control}
          name="comments"
          render={({ field }) => (
            <FormItem className="space-y-1">
              <FormLabel className="text-xs">Comments</FormLabel>
              <FormControl>
                <Input 
                  placeholder="Additional notes about this album"
                  className="h-7 text-xs"
                  {...field}
                />
              </FormControl>
              <FormMessage className="text-xs" />
            </FormItem>
          )}
        />
        <DialogFooter className="pt-1 gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={isUploading}
            size="sm"
            className="text-xs"
          >
            Cancel
          </Button>
          <Button 
            type="submit" 
            disabled={isUploading}
            size="sm"
            className="text-xs"
          >
            {isUploading ? "Uploading..." : "Add Album"}
          </Button>
        </DialogFooter>
      </form>
    </Form>
  );
};

export default AlbumForm;
