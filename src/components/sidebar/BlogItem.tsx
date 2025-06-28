import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import { useAuth } from '@/context/AuthContext';
// import { deleteBlogArticle } from '@/utils/blogUtils'; // TODO: Implement blog API
import { toast } from '@/hooks/use-toast';
import { useQueryClient } from '@tanstack/react-query';
import { Trash2 } from 'lucide-react';

interface BlogArticle {
  id: string;
  title: string;
  excerpt?: string;
  author: string;
  image_url?: string | null;
  published_at: string;
  category?: string;
}

interface BlogItemProps {
  article: BlogArticle;
  onDeleted?: () => void; // Added callback for parent components to refresh
}

const ADMIN_EMAILS = [
  "wjparker@outlook.com",
  "ghodgett59@gmail.com"
];

const BlogItem: React.FC<BlogItemProps> = ({ article, onDeleted }) => {
  // Format the date as "X days ago"
  const formattedDate = formatDistanceToNow(new Date(article.published_at), { addSuffix: true });
  const { user } = useAuth();
  const isAdmin = user && ADMIN_EMAILS.includes(user.email ?? "");
  const navigate = useNavigate();
  const [isDeleting, setIsDeleting] = useState(false);
  const queryClient = useQueryClient();
  const [imageError, setImageError] = useState(false);
  
  // Keeping handleDelete as it's used for sidebar items, not card thumbnails
  const handleDelete = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (isDeleting) return; // Prevent multiple deletion attempts
    
    console.log("Delete clicked for article:", article.id);
    setIsDeleting(true);
    
    toast({
      title: "Deleting article...",
      description: "Please wait while we delete this article"
    });
    
    try {
      // TODO: Implement actual blog deletion via Express API
      console.log("Would delete article:", article.id);
      
      // Simulate success for now
      queryClient.invalidateQueries({ queryKey: ['sidebar-blogs'] });
      queryClient.invalidateQueries({ queryKey: ['blog-posts'] });
      
      if (onDeleted) {
        console.log("Calling onDeleted callback for sidebar refresh");
        onDeleted();
      }
      
      toast({
        title: "Article deleted (simulated)",
        description: "Blog deletion is not yet implemented with Express API"
      });
    } catch (error) {
      console.error("Error deleting article:", error);
      toast({
        title: "Error",
        description: "Failed to delete the article",
        variant: "destructive"
      });
    } finally {
      setIsDeleting(false);
    }
  };
  
  return (
    <Link to={`/blog/${article.id}`} className="block">
      <div className="flex items-center gap-3 p-2 rounded-md hover:bg-zinc-900 cursor-pointer group relative">
        <div className="flex-shrink-0 w-10 h-10 rounded-md overflow-hidden flex items-center justify-center bg-zinc-700">
          {article.image_url && !imageError ? (
            <img 
              src={article.image_url} 
              alt={article.title} 
              className="w-full h-full object-cover" 
              onError={(e) => {
                console.error("Error loading image:", article.image_url);
                setImageError(true);
              }}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <span className="text-sm font-medium text-white">{article.title[0]?.toUpperCase() || 'B'}</span>
            </div>
          )}
        </div>
        
        <div className="flex flex-col min-w-0 pr-6">
          <span className="text-sm font-medium text-white truncate group-hover:text-theme-color transition-colors">
            {article.title}
          </span>
          <div className="flex items-center text-xs text-spotify-text-secondary">
            <span className="truncate">
              {article.category || 'Blog'} • {article.author} • {formattedDate}
            </span>
          </div>
        </div>
        
        {isAdmin && (
          <button 
            onClick={handleDelete}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded-full opacity-100 hover:bg-red-600 transition-opacity"
            aria-label="Delete article"
            disabled={isDeleting}
          >
            <Trash2 size={16} className={`text-white ${isDeleting ? 'opacity-50' : ''}`} />
          </button>
        )}
      </div>
    </Link>
  );
};

export default BlogItem;
