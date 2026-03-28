import { useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, Upload, File, FileText, Image, Trash2, Paperclip, Download } from 'lucide-react';
import api from '../services/api';
import type { Document, ApiResponse } from '../types';
import toast from 'react-hot-toast';

const CATEGORY_LABELS: Record<string, string> = {
  flight: '항공권', hotel: '숙소', insurance: '보험', visa: '비자', transport: '교통', other: '기타',
};

function getFileIcon(mimeType: string | null) {
  if (mimeType?.startsWith('image/')) return <Image className="w-5 h-5 text-purple-500" />;
  if (mimeType === 'application/pdf') return <FileText className="w-5 h-5 text-red-500" />;
  return <File className="w-5 h-5 text-blue-500" />;
}

export default function DocumentsPage() {
  const { id } = useParams<{ id: string }>();
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { data: documents, isLoading } = useQuery({
    queryKey: ['documents', id],
    queryFn: async () => {
      const { data } = await api.get<ApiResponse<Document[]>>(`/trips/${id}/documents`);
      return data.data;
    },
  });

  const uploadMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('title', file.name);
      return api.post(`/trips/${id}/documents`, formData, { headers: { 'Content-Type': 'multipart/form-data' } });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['documents', id] });
      toast.success('문서가 업로드되었습니다.');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (did: string) => api.delete(`/trips/${id}/documents/${did}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['documents', id] });
      toast.success('문서가 삭제되었습니다.');
    },
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Link to={`/trips/${id}`} className="p-2 rounded-lg hover:bg-gray-100"><ArrowLeft className="w-5 h-5" /></Link>
          <h1 className="text-2xl font-bold">문서 보관함</h1>
        </div>
        <button onClick={() => fileInputRef.current?.click()} className="flex items-center gap-2 px-4 py-2 bg-navy text-white rounded-lg font-medium hover:bg-navy-dark">
          <Upload className="w-4 h-4" /> 업로드
        </button>
        <input ref={fileInputRef} type="file" className="hidden" onChange={e => e.target.files?.[0] && uploadMutation.mutate(e.target.files[0])} />
      </div>

      {isLoading ? (
        <div className="space-y-3">{[1, 2, 3].map(i => <div key={i} className="h-16 bg-gray-200 rounded-xl animate-pulse" />)}</div>
      ) : documents && documents.length > 0 ? (
        <div className="space-y-3">
          {documents.map((doc) => (
            <div key={doc.id} className="bg-white rounded-xl border border-gray-200 p-4 flex items-center justify-between group">
              <div className="flex items-center gap-3">
                {getFileIcon(doc.mimeType)}
                <div>
                  <div className="font-medium">{doc.title}</div>
                  <div className="text-xs text-gray-500">
                    {doc.category && CATEGORY_LABELS[doc.category]}{doc.category && ' \u00B7 '}
                    {doc.fileSize && `${(Number(doc.fileSize) / 1024 / 1024).toFixed(1)}MB`}
                    {doc.uploader && ` \u00B7 ${doc.uploader.name}`}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <a href={doc.filePath} target="_blank" rel="noopener noreferrer" className="p-1.5 rounded hover:bg-gray-100 text-gray-400">
                  <Download className="w-4 h-4" />
                </a>
                <button onClick={() => deleteMutation.mutate(doc.id)} className="p-1.5 rounded hover:bg-red-50 text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100">
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-16 text-gray-500">
          <Paperclip className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p>아직 문서가 없습니다</p>
        </div>
      )}
    </div>
  );
}
