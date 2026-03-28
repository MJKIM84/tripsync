import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useTripSocket } from '../hooks/useSocket';
import { ArrowLeft, Plus, CheckSquare, Square, Check, X, Trash2, User } from 'lucide-react';
import api from '../services/api';
import type { Checklist, ApiResponse } from '../types';
import toast from 'react-hot-toast';

export default function ChecklistPage() {
  const { id } = useParams<{ id: string }>();
  const queryClient = useQueryClient();
  const [newListTitle, setNewListTitle] = useState('');
  const [showNewList, setShowNewList] = useState(false);
  const [newItemInputs, setNewItemInputs] = useState<Record<string, string>>({});
  const socket = useTripSocket(id);

  useEffect(() => {
    if (!socket) return;
    const refresh = () => queryClient.invalidateQueries({ queryKey: ['checklists', id] });
    socket.on('checklist:item_checked', refresh);
    socket.on('checklist:item_unchecked', refresh);
    return () => {
      socket.off('checklist:item_checked', refresh);
      socket.off('checklist:item_unchecked', refresh);
    };
  }, [socket, id, queryClient]);

  const { data: checklists, isLoading } = useQuery({
    queryKey: ['checklists', id],
    queryFn: async () => {
      const { data } = await api.get<ApiResponse<Checklist[]>>(`/trips/${id}/checklists`);
      return data.data;
    },
  });

  const createListMutation = useMutation({
    mutationFn: (title: string) => api.post(`/trips/${id}/checklists`, { title }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['checklists', id] });
      setNewListTitle('');
      setShowNewList(false);
    },
  });

  const addItemMutation = useMutation({
    mutationFn: ({ cid, title }: { cid: string; title: string }) =>
      api.post(`/trips/${id}/checklists/${cid}/items`, { title }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['checklists', id] }),
  });

  const toggleItemMutation = useMutation({
    mutationFn: ({ cid, iid, isChecked }: { cid: string; iid: string; isChecked: boolean }) =>
      api.put(`/trips/${id}/checklists/${cid}/items/${iid}`, { isChecked }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['checklists', id] }),
  });

  const deleteItemMutation = useMutation({
    mutationFn: ({ cid, iid }: { cid: string; iid: string }) =>
      api.delete(`/trips/${id}/checklists/${cid}/items/${iid}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['checklists', id] }),
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Link to={`/trips/${id}`} className="p-2 rounded-lg hover:bg-gray-100"><ArrowLeft className="w-5 h-5" /></Link>
          <h1 className="text-2xl font-bold">체크리스트</h1>
        </div>
        <button onClick={() => setShowNewList(true)} className="flex items-center gap-2 px-4 py-2 bg-navy text-white rounded-lg font-medium hover:bg-navy-dark">
          <Plus className="w-4 h-4" /> 새 리스트
        </button>
      </div>

      {showNewList && (
        <div className="bg-white rounded-xl border border-gray-200 p-4 mb-4">
          <form onSubmit={e => { e.preventDefault(); createListMutation.mutate(newListTitle); }} className="flex gap-2">
            <input type="text" value={newListTitle} onChange={e => setNewListTitle(e.target.value)} placeholder="리스트 이름 (예: 준비물)"
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg" required autoFocus />
            <button type="submit" className="px-4 py-2 bg-navy text-white rounded-lg text-sm">추가</button>
            <button type="button" onClick={() => setShowNewList(false)} className="px-3 py-2 text-gray-500"><X className="w-4 h-4" /></button>
          </form>
        </div>
      )}

      {isLoading ? (
        <div className="space-y-4">{[1, 2].map(i => <div key={i} className="h-40 bg-gray-200 rounded-xl animate-pulse" />)}</div>
      ) : checklists && checklists.length > 0 ? (
        <div className="space-y-4">
          {checklists.map((cl) => {
            const totalItems = cl.items.length;
            const checkedItems = cl.items.filter(i => i.isChecked).length;
            const progress = totalItems > 0 ? (checkedItems / totalItems) * 100 : 0;

            return (
              <div key={cl.id} className="bg-white rounded-xl border border-gray-200 p-5">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-lg">{cl.title}</h3>
                  <span className="text-sm text-gray-500">{checkedItems}/{totalItems}</span>
                </div>

                {/* Progress bar */}
                <div className="h-1.5 bg-gray-100 rounded-full mb-4">
                  <div className="h-full bg-green-500 rounded-full transition-all" style={{ width: `${progress}%` }} />
                </div>

                {/* Items */}
                <div className="space-y-1">
                  {cl.items.map(item => (
                    <div key={item.id} className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-50 group">
                      <button onClick={() => toggleItemMutation.mutate({ cid: cl.id, iid: item.id, isChecked: !item.isChecked })}>
                        {item.isChecked
                          ? <CheckSquare className="w-5 h-5 text-green-500" />
                          : <Square className="w-5 h-5 text-gray-300" />}
                      </button>
                      <span className={`flex-1 ${item.isChecked ? 'line-through text-gray-400' : ''}`}>{item.title}</span>
                      {item.assignee && (
                        <span className="text-xs text-gray-400 flex items-center gap-1">
                          <User className="w-3 h-3" /> {item.assignee.name}
                        </span>
                      )}
                      <button onClick={() => deleteItemMutation.mutate({ cid: cl.id, iid: item.id })}
                        className="p-1 rounded hover:bg-red-50 text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>

                {/* Add item */}
                <form onSubmit={e => { e.preventDefault(); const title = newItemInputs[cl.id]; if (title) { addItemMutation.mutate({ cid: cl.id, title }); setNewItemInputs(prev => ({ ...prev, [cl.id]: '' })); } }} className="mt-2">
                  <div className="flex gap-2">
                    <input type="text" value={newItemInputs[cl.id] || ''} onChange={e => setNewItemInputs(prev => ({ ...prev, [cl.id]: e.target.value }))}
                      placeholder="항목 추가..." className="flex-1 px-3 py-1.5 text-sm border border-gray-200 rounded-lg" />
                    <button type="submit" className="px-3 py-1.5 text-sm bg-gray-100 rounded-lg hover:bg-gray-200">
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </form>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-16 text-gray-500">
          <Check className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p>아직 체크리스트가 없습니다</p>
        </div>
      )}
    </div>
  );
}
