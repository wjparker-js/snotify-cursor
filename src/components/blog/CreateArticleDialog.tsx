
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import ArticleForm from './ArticleForm';
import { uploadImageFile, fileToBase64 } from '@/utils/fileUpload';
import { useNavigate } from 'react-router-dom';
import { ScrollArea } from "@/components/ui/scroll-area";
import { useQueryClient } from '@tanstack/react-query';
import { extractYouTubeVideoId, convertYouTubeUrlsToEmbeds } from '@/utils/youtubeUtils';
import { supabase } from '@/integrations/supabase/client';

interface CreateArticleDialogProps {
  children: React.ReactNode;
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

const CreateArticleDialog: React.FC<CreateArticleDialogProps> = ({
  children
}) => {
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const handleSubmit = async (values: ArticleFormValues) => {
    setIsSubmitting(true);
    try {
      let imageUrl = '/placeholder.svg'; // Default image

      // Upload image if provided
      if (values.imageFile) {
        console.log('Processing image file:', values.imageFile.name, 'Size:', values.imageFile.size, 'Type:', values.imageFile.type);
        
        // Validate file type
        if (!values.imageFile.type.startsWith('image/')) {
          throw new Error('Invalid file type. Only images are allowed.');
        }
        
        // Validate file size (max 5MB)
        if (values.imageFile.size > 5 * 1024 * 1024) {
          throw new Error('File too large. Maximum size is 5MB.');
        }
        
        try {
          // First convert to base64 as a fallback
          const base64Image = await fileToBase64(values.imageFile);
          
          // Try to upload to Supabase Storage and get URL
          imageUrl = await uploadImageFile(values.imageFile, 'blog');
          console.log('Image processed successfully:', imageUrl);
        } catch (error) {
          console.error('Failed to process image:', error);
          imageUrl = '/placeholder.svg';
        }
      } else if (values.youtubeVideoId) {
        // If YouTube video ID is provided, use its thumbnail
        imageUrl = `https://img.youtube.com/vi/${values.youtubeVideoId}/hqdefault.jpg`;
      }

      // Process content to convert any YouTube URLs to embeds
      const processedContent = convertYouTubeUrlsToEmbeds(values.content);
      console.log('Processed content:', processedContent);

      // Generate excerpt if not provided (use first 150 chars of content)
      const excerpt = processedContent
        .replace(/<[^>]*>/g, '') // Remove HTML tags
        .replace(/\*\*(.*?)\*\*/g, '$1')
        .replace(/\*(.*?)\*/g, '$1')
        .replace(/\[(.*?)\]\((.*?)\)/g, '$1')
        .replace(/!\[(.*?)\]\((.*?)\)/g, '')
        .replace(/<div class="youtube-embed" data-youtube-id="([^"]+)"><\/div>/g, '[YouTube Video]')
        .replace(/<div style="text-align: (left|center|right);">(.*?)<\/div>/g, '$2')
        .substring(0, 150) + '...';

      console.log('Creating article with image URL:', imageUrl);
      console.log('Excerpt:', excerpt);

      // Insert article into database
      const { data, error } = await supabase.from('blog_articles').insert({
        title: values.title,
        subtitle: values.subtitle || null,
        content: processedContent,
        excerpt: excerpt,
        image_url: imageUrl,
        author: values.author || 'Anonymous',
        category: values.category,
        published_at: new Date().toISOString()
      }).select('id').single();
      
      if (error) {
        console.error('Supabase insert error:', error);
        throw error;
      }
      
      // Invalidate queries to refresh data
      queryClient.invalidateQueries({ queryKey: ['blog-posts'] });
      queryClient.invalidateQueries({ queryKey: ['sidebar-blogs'] });
      
      setOpen(false);

      // Navigate to the newly created article
      if (data && data.id) {
        navigate(`/blog/${data.id}`);
      } else {
        // Refresh the blog page to show the new article
        navigate('/blog');
      }
    } catch (error) {
      console.error('Error creating article:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-3xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle>Create New Blog Post</DialogTitle>
        </DialogHeader>
        <ScrollArea className="max-h-[calc(80vh-120px)] overflow-auto pr-4">
          <ArticleForm 
            isSubmitting={isSubmitting} 
            onSubmit={handleSubmit} 
            onCancel={() => setOpen(false)} 
          />
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};

export default CreateArticleDialog;
