
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog";
import ArticleForm from './ArticleForm';
import { uploadImageFile } from '@/utils/fileUpload';
import { useNavigate } from 'react-router-dom';
import { BlogArticle } from '@/types';
import { useQueryClient } from '@tanstack/react-query';
import { Spinner } from "@/components/ui/spinner";
import { convertYouTubeUrlsToEmbeds } from '@/utils/youtubeUtils';

interface EditArticleDialogProps {
  children: React.ReactNode;
  article: BlogArticle;
  onArticleUpdated?: () => void;
}

interface ArticleFormValues {
  title: string;
  subtitle: string;
  content: string;
  category: string;
  author: string;
  imageFile?: File | null;
  youtubeVideoId?: string;
}

const EditArticleDialog: React.FC<EditArticleDialogProps> = ({ 
  children, 
  article,
  onArticleUpdated 
}) => {
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const handleSubmit = async (values: ArticleFormValues) => {
    setIsSubmitting(true);
    try {
      let imageUrl = article.image_url || '/placeholder.svg'; // Keep existing image by default
      
      // Upload new image if provided
      if (values.imageFile) {
        console.log('Processing new image file:', values.imageFile.name, 'Size:', values.imageFile.size, 'Type:', values.imageFile.type);
        
        try {
          // Upload to Supabase Storage and get URL
          imageUrl = await uploadImageFile(values.imageFile, 'blog');
          console.log('New image uploaded successfully:', imageUrl);
        } catch (error) {
          console.error('Failed to upload new image:', error);
        }
      } else if (values.youtubeVideoId) {
        // If YouTube video ID is provided, use its thumbnail
        console.log('Using YouTube thumbnail as image, video ID:', values.youtubeVideoId);
        imageUrl = `https://img.youtube.com/vi/${values.youtubeVideoId}/hqdefault.jpg`;
      }
      
      // Process content to convert any YouTube URLs to embeds
      const processedContent = convertYouTubeUrlsToEmbeds(values.content);
      console.log('Processed content for update:', processedContent);
      
      // Generate excerpt if content changed (use first 150 chars of content)
      const excerpt = processedContent
        .replace(/<[^>]*>/g, '') // Remove HTML tags
        .replace(/\*\*(.*?)\*\*/g, '$1')
        .replace(/\*(.*?)\*/g, '$1')
        .replace(/\[(.*?)\]\((.*?)\)/g, '$1')
        .replace(/!\[(.*?)\]\((.*?)\)/g, '')
        .replace(/<div class="youtube-embed" data-youtube-id="([^"]+)"><\/div>/g, '[YouTube Video]')
        .replace(/<div style="text-align: (left|center|right);">(.*?)<\/div>/g, '$2')
        .substring(0, 150) + '...';
      
      console.log('Updating article with image URL:', imageUrl);
      console.log('Generated excerpt:', excerpt);
      
      // Create the update object with all fields
      const updateData = {
        title: values.title,
        subtitle: values.subtitle || null, // Handle empty subtitle
        content: processedContent,
        excerpt: excerpt,
        image_url: imageUrl,
        category: values.category
      };
      
      console.log('Update data being sent to Supabase:', updateData);
      
      // TODO: Replace with actual API call to Express backend
      console.log('Would update article with data:', updateData);
      console.log('Article ID:', article.id);
      
      // Simulate success for now
      const data = { id: article.id, ...updateData };
      console.log('Article updated successfully (simulated):', data);
      
      // Invalidate queries to refresh data
      queryClient.invalidateQueries({ queryKey: ['blog-posts'] });
      queryClient.invalidateQueries({ queryKey: ['sidebar-blogs'] });
      
      setOpen(false);

      // Call callback if provided
      if (onArticleUpdated) {
        onArticleUpdated();
      }
    } catch (error) {
      console.error('Error updating article:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Convert the article data to form values
  const articleToFormValues = (): ArticleFormValues => {
    return {
      title: article.title,
      subtitle: article.subtitle || '',
      content: article.content || '',
      category: article.category || 'General',
      author: article.author,
      imageFile: null,
    };
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-3xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Article</DialogTitle>
          <DialogDescription>
            Make changes to your article below. Click save when you're done.
          </DialogDescription>
        </DialogHeader>
        {isSubmitting ? (
          <div className="flex flex-col items-center justify-center py-8">
            <Spinner size="lg" className="mb-4" />
            <p className="text-center text-muted-foreground">Saving your changes...</p>
          </div>
        ) : (
          <ArticleForm 
            isSubmitting={isSubmitting}
            onSubmit={handleSubmit}
            onCancel={() => setOpen(false)}
            initialValues={articleToFormValues()}
            imageUrl={article.image_url}
            isEditing={true}
          />
        )}
      </DialogContent>
    </Dialog>
  );
};

export default EditArticleDialog;
