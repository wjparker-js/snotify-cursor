
import React, { useRef, useCallback } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import Link from '@tiptap/extension-link';
import TextAlign from '@tiptap/extension-text-align';
import { Button } from "@/components/ui/button";
import {
  Bold,
  Italic,
  AlignLeft,
  AlignCenter,
  AlignRight,
  List,
  Image as ImageIcon,
  Link as LinkIcon,
  Youtube
} from 'lucide-react';
import { extractYouTubeVideoId, generateYouTubeEmbed, isYouTubeUrl } from '@/utils/youtubeUtils';

interface RichTextEditorProps {
  content: string;
  onChange: (content: string) => void;
  placeholder?: string;
}

const RichTextEditor = ({ content, onChange, placeholder }: RichTextEditorProps) => {
  // Reference to store the last selection position
  const selectionRef = useRef<any>(null);

  // Initialize the editor
  const editor = useEditor({
    extensions: [
      StarterKit,
      Image,
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-blue-500 underline',
        },
      }),
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
    ],
    content,
    editorProps: {
      attributes: {
        class: 'prose dark:prose-invert max-w-none min-h-[300px] focus:outline-none px-4 py-2',
      },
      handlePaste: (view, event) => {
        // Store the current selection
        selectionRef.current = view.state.selection;
        return false; // Don't prevent the default paste behavior
      },
    },
    onUpdate({ editor }) {
      onChange(editor.getHTML());
    },
    onSelectionUpdate({ editor }) {
      // Store the selection whenever it changes
      selectionRef.current = editor.state.selection;
    }
  });

  const handleYoutubeEmbed = useCallback(() => {
    if (!editor) return;
    
    const url = window.prompt('Enter YouTube URL');
    if (!url) return;
    
    const videoId = extractYouTubeVideoId(url);
    if (!videoId) {
      alert('Invalid YouTube URL');
      return;
    }

    // Insert the YouTube embed at the current selection
    editor.chain().focus().insertContent(generateYouTubeEmbed(videoId)).run();
  }, [editor]);

  // Handler for pasting content
  const handlePaste = useCallback((e: React.ClipboardEvent) => {
    if (!editor) return;
    
    const text = e.clipboardData.getData('text/plain');
    if (isYouTubeUrl(text)) {
      e.preventDefault(); // Prevent default paste
      
      const videoId = extractYouTubeVideoId(text);
      if (videoId) {
        // Insert the YouTube embed at the current selection
        editor.chain().focus().insertContent(generateYouTubeEmbed(videoId)).run();
      }
    }
  }, [editor]);

  if (!editor) {
    return null;
  }

  return (
    <div 
      className="relative border rounded-md bg-background"
      onPaste={handlePaste}
    >
      <div className="flex items-center gap-1 p-2 border-b flex-wrap">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="h-8 w-8 p-0"
          onClick={() => editor.chain().focus().toggleBold().run()}
          data-active={editor.isActive('bold')}
        >
          <Bold className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="h-8 w-8 p-0"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          data-active={editor.isActive('italic')}
        >
          <Italic className="h-4 w-4" />
        </Button>
        <div className="h-4 border-r border-border mx-1" />
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="h-8 w-8 p-0"
          onClick={() => editor.chain().focus().setTextAlign('left').run()}
          data-active={editor.isActive({ textAlign: 'left' })}
        >
          <AlignLeft className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="h-8 w-8 p-0"
          onClick={() => editor.chain().focus().setTextAlign('center').run()}
          data-active={editor.isActive({ textAlign: 'center' })}
        >
          <AlignCenter className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="h-8 w-8 p-0"
          onClick={() => editor.chain().focus().setTextAlign('right').run()}
          data-active={editor.isActive({ textAlign: 'right' })}
        >
          <AlignRight className="h-4 w-4" />
        </Button>
        <div className="h-4 border-r border-border mx-1" />
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="h-8 w-8 p-0"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          data-active={editor.isActive('bulletList')}
        >
          <List className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="h-8 w-8 p-0"
          onClick={() => {
            const url = window.prompt('Enter image URL');
            if (url) {
              editor.chain().focus().insertContent(`<img src="${url}" alt="Image" />`).run();
            }
          }}
        >
          <ImageIcon className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="h-8 w-8 p-0"
          onClick={() => {
            const url = window.prompt('Enter link URL');
            if (url) {
              if (editor.isActive('link')) {
                editor.chain().focus().unsetLink().run();
              } else {
                editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
              }
            }
          }}
        >
          <LinkIcon className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="h-8 px-2 py-0"
          onClick={handleYoutubeEmbed}
        >
          <Youtube className="h-4 w-4 mr-1" />
          <span className="text-xs">YouTube</span>
        </Button>
      </div>
      <EditorContent editor={editor} />
    </div>
  );
};

export default RichTextEditor;
