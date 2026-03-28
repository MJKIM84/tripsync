import { createClient } from '@supabase/supabase-js';
import { v4 as uuidv4 } from 'uuid';
import path from 'path';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY;

const supabase = supabaseUrl && supabaseKey
  ? createClient(supabaseUrl, supabaseKey)
  : null;

export function isCloudStorageEnabled() {
  return !!supabase;
}

export async function uploadFile(
  buffer: Buffer,
  options: { bucket: string; folder: string; fileName: string; contentType: string }
): Promise<string> {
  if (!supabase) throw new Error('Supabase not configured');

  const ext = path.extname(options.fileName);
  const key = `${options.folder}/${uuidv4()}${ext}`;

  const { error } = await supabase.storage
    .from(options.bucket)
    .upload(key, buffer, {
      contentType: options.contentType,
      upsert: false,
    });

  if (error) throw error;

  const { data } = supabase.storage
    .from(options.bucket)
    .getPublicUrl(key);

  return data.publicUrl;
}

export async function deleteFile(bucket: string, filePath: string) {
  if (!supabase) return;
  try {
    // Extract key from full URL
    const url = new URL(filePath);
    const parts = url.pathname.split(`/storage/v1/object/public/${bucket}/`);
    if (parts.length > 1) {
      await supabase.storage.from(bucket).remove([parts[1]]);
    }
  } catch (error) {
    console.error('[Storage] Delete failed:', error);
  }
}
