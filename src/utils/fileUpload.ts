// TODO: Implement file upload using local storage or another provider. Supabase logic removed.

export async function uploadFile(/* params */) {
  throw new Error('File upload is not implemented. Replace with local or alternative storage.');
}

export async function uploadAudioFile(/* params */) {
  throw new Error('Audio file upload is not implemented. Replace with local or alternative storage.');
}

/**
 * Gets a YouTube video thumbnail URL from a video URL or ID
 */
export function getYouTubeThumbnail(urlOrId: string): string {
  let videoId = urlOrId;
  
  // If it's a URL, extract the video ID
  if (urlOrId.includes('youtube.com') || urlOrId.includes('youtu.be')) {
    const urlObj = new URL(urlOrId);
    if (urlOrId.includes('youtube.com')) {
      videoId = urlObj.searchParams.get('v') || '';
    } else if (urlOrId.includes('youtu.be')) {
      videoId = urlObj.pathname.substring(1);
    }
  }
  
  return `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
}

/**
 * Uploads a file to Supabase Storage
 * @param file File or string URL to upload
 * @param bucket Storage bucket name
 * @returns URL of the uploaded file
 */
export async function uploadImageFile(file: File | string, bucket: string): Promise<string> {
  try {
    // If file is already a URL string (not a File object), return it directly
    if (typeof file === 'string') {
      // Check if it's a YouTube URL or ID
      if (file.includes('youtube.com') || file.includes('youtu.be') || file.match(/^[a-zA-Z0-9_-]{11}$/)) {
        return getYouTubeThumbnail(file);
      }
      return file;
    }

    // Continue with file upload logic for File objects
    const fileExt = file.name.split('.').pop();
    const fileName = `${crypto.randomUUID()}.${fileExt}`;
    const filePath = `lovable-uploads/${fileName}`;
    
    const { data, error } = await supabase.storage
      .from('public')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false,
      });
    
    if (error) {
      console.error('Error uploading file:', error);
      throw new Error(`Failed to upload file: ${error.message}`);
    }
    
    const { data: { publicUrl } } = supabase.storage
      .from('public')
      .getPublicUrl(filePath);
    
    return publicUrl;
  } catch (error) {
    console.error('Error in uploadImageFile:', error);
    throw error;
  }
}

/**
 * Converts a file to a base64 string
 * @param file File to convert
 * @returns Base64 string of the file
 */
export function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
  });
}

/**
 * Generates a file path for uploading to storage
 * @param albumId Album ID
 * @param fileName Original file name
 * @returns Generated file path
 */
export function generateFilePath(albumId: string, fileName: string): string {
  const fileExt = fileName.split('.').pop();
  const uniqueId = crypto.randomUUID();
  return `albums/${albumId}/tracks/${uniqueId}.${fileExt}`;
}

/**
 * Gets the public URL for an audio file
 * @param filePath Path of the file in storage
 * @returns Public URL of the file
 */
export function getAudioUrl(filePath: string): string {
  const { data: { publicUrl } } = supabase.storage
    .from('public')
    .getPublicUrl(filePath);
  
  return publicUrl;
}
