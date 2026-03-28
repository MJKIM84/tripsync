import { useRef, useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useTripSocket } from '../hooks/useSocket';
import { ArrowLeft, Upload, Camera, Trash2, X, ChevronLeft, ChevronRight } from 'lucide-react';
import api from '../services/api';
import type { Photo, ApiResponse } from '../types';
import toast from 'react-hot-toast';
import CommentsSection from '../components/CommentsSection';

export default function GalleryPage() {
  const { id } = useParams<{ id: string }>();
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null);
  const socket = useTripSocket(id);

  useEffect(() => {
    if (!socket) return;
    const refresh = () => queryClient.invalidateQueries({ queryKey: ['photos', id] });
    socket.on('photo:uploaded', refresh);
    return () => { socket.off('photo:uploaded', refresh); };
  }, [socket, id, queryClient]);

  const { data: photos, isLoading } = useQuery({
    queryKey: ['photos', id],
    queryFn: async () => {
      const { data } = await api.get<ApiResponse<Photo[]>>(`/trips/${id}/photos`);
      return data.data;
    },
  });

  const uploadMutation = useMutation({
    mutationFn: async (files: FileList) => {
      const formData = new FormData();
      Array.from(files).forEach(f => formData.append('photos', f));
      return api.post(`/trips/${id}/photos`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['photos', id] });
      toast.success('사진이 업로드되었습니다!');
    },
    onError: () => toast.error('업로드에 실패했습니다.'),
  });

  const deleteMutation = useMutation({
    mutationFn: (pid: string) => api.delete(`/trips/${id}/photos/${pid}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['photos', id] });
      toast.success('사진이 삭제되었습니다.');
    },
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Link to={`/trips/${id}`} className="p-2 rounded-lg hover:bg-gray-100"><ArrowLeft className="w-5 h-5" /></Link>
          <h1 className="text-2xl font-bold">사진 갤러리</h1>
          {photos && <span className="text-sm text-gray-400">{photos.length}장</span>}
        </div>
        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={uploadMutation.isPending}
          className="flex items-center gap-2 px-4 py-2 bg-navy text-white rounded-lg font-medium hover:bg-navy-dark disabled:opacity-50"
        >
          <Upload className="w-4 h-4" /> {uploadMutation.isPending ? '업로드 중...' : '업로드'}
        </button>
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*"
          className="hidden"
          onChange={(e) => e.target.files && uploadMutation.mutate(e.target.files)}
        />
      </div>

      {isLoading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {[1, 2, 3, 4, 5, 6].map(i => <div key={i} className="aspect-square bg-gray-200 rounded-xl animate-pulse" />)}
        </div>
      ) : photos && photos.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {photos.map((photo) => (
            <div key={photo.id} className="relative group aspect-square rounded-xl overflow-hidden bg-gray-100 cursor-pointer" onClick={() => setSelectedPhoto(photo)}>
              <img
                src={photo.mediumPath || photo.thumbnailPath || photo.filePath}
                alt={photo.caption || ''}
                className="w-full h-full object-cover"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
              <button
                onClick={() => deleteMutation.mutate(photo.id)}
                className="absolute top-2 right-2 p-1.5 bg-white/90 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white text-red-500"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
              {photo.uploader && (
                <div className="absolute bottom-2 left-2 text-xs text-white/80 opacity-0 group-hover:opacity-100 transition-opacity">
                  {photo.uploader.name}
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-16 text-gray-500">
          <Camera className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p>아직 사진이 없습니다</p>
          <button onClick={() => fileInputRef.current?.click()} className="mt-3 px-4 py-2 bg-navy text-white rounded-lg text-sm">
            첫 사진 업로드
          </button>
        </div>
      )}

      {/* Photo Detail Modal */}
      {selectedPhoto && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4" onClick={() => setSelectedPhoto(null)}>
          <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden flex flex-col" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <div className="flex items-center gap-2">
                {selectedPhoto.uploader && <span className="text-sm text-gray-600">{selectedPhoto.uploader.name}</span>}
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => { deleteMutation.mutate(selectedPhoto.id); setSelectedPhoto(null); }} className="p-1.5 rounded hover:bg-red-50 text-gray-400 hover:text-red-500">
                  <Trash2 className="w-4 h-4" />
                </button>
                <button onClick={() => setSelectedPhoto(null)} className="p-1.5 rounded hover:bg-gray-100">
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto">
              <img src={selectedPhoto.filePath} alt={selectedPhoto.caption || ''} className="w-full object-contain max-h-[60vh]" />
              {selectedPhoto.caption && <p className="px-4 py-2 text-sm text-gray-600">{selectedPhoto.caption}</p>}
              <div className="px-4 pb-4">
                <CommentsSection tripId={id!} targetType="photo" targetId={selectedPhoto.id} />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
