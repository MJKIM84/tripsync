import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, Plus, MapPin, Star, Edit2, Trash2, X, Utensils, Coffee, Landmark, Hotel, ShoppingBag, MoreHorizontal } from 'lucide-react';
import api from '../services/api';
import type { Place, ApiResponse } from '../types';
import toast from 'react-hot-toast';

const CATEGORIES = [
  { value: 'restaurant', label: '맛집', icon: Utensils },
  { value: 'cafe', label: '카페', icon: Coffee },
  { value: 'attraction', label: '관광지', icon: Landmark },
  { value: 'hotel', label: '숙소', icon: Hotel },
  { value: 'shopping', label: '쇼핑', icon: ShoppingBag },
  { value: 'other', label: '기타', icon: MoreHorizontal },
];

const CATEGORY_MAP = Object.fromEntries(CATEGORIES.map((c) => [c.value, c]));

export default function PlacesPage() {
  const { id } = useParams<{ id: string }>();
  const queryClient = useQueryClient();
  const [filter, setFilter] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const { data: places, isLoading } = useQuery({
    queryKey: ['places', id, filter],
    queryFn: async () => {
      const params = filter ? `?category=${filter}` : '';
      const { data } = await api.get<ApiResponse<Place[]>>(`/trips/${id}/places${params}`);
      return data.data;
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (pid: string) => api.delete(`/trips/${id}/places/${pid}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['places', id] });
      toast.success('장소가 삭제되었습니다.');
    },
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Link to={`/trips/${id}`} className="p-2 rounded-lg hover:bg-gray-100">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <h1 className="text-2xl font-bold">장소</h1>
          {places && <span className="text-sm text-gray-400">{places.length}곳</span>}
        </div>
        <button
          onClick={() => { setEditingId(null); setShowForm(true); }}
          className="flex items-center gap-2 px-4 py-2 bg-navy text-white rounded-lg font-medium hover:bg-navy-dark"
        >
          <Plus className="w-4 h-4" /> 장소 추가
        </button>
      </div>

      {/* Category Filter */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-1">
        <button
          onClick={() => setFilter('')}
          className={`px-3 py-1.5 rounded-full text-sm font-medium whitespace-nowrap ${
            !filter ? 'bg-navy text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          전체
        </button>
        {CATEGORIES.map((cat) => (
          <button
            key={cat.value}
            onClick={() => setFilter(filter === cat.value ? '' : cat.value)}
            className={`px-3 py-1.5 rounded-full text-sm font-medium whitespace-nowrap flex items-center gap-1.5 ${
              filter === cat.value ? 'bg-navy text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            <cat.icon className="w-3.5 h-3.5" />
            {cat.label}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => <div key={i} className="h-20 bg-gray-200 rounded-xl animate-pulse" />)}
        </div>
      ) : places && places.length > 0 ? (
        <div className="space-y-3">
          {places.map((place) => {
            const cat = CATEGORY_MAP[place.category || 'other'] || CATEGORY_MAP['other'];
            const CatIcon = cat.icon;
            return (
              <div key={place.id} className="bg-white rounded-xl border border-gray-200 p-4 flex items-start gap-3 group">
                <div className="w-10 h-10 rounded-lg bg-accent flex items-center justify-center text-navy shrink-0">
                  <CatIcon className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="font-medium">{place.name}</h3>
                    {place.rating && (
                      <div className="flex items-center gap-0.5">
                        {[1, 2, 3, 4, 5].map((s) => (
                          <Star
                            key={s}
                            className={`w-3 h-3 ${s <= place.rating! ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                  {place.address && (
                    <span className="text-sm text-gray-500 flex items-center gap-1 mt-0.5">
                      <MapPin className="w-3 h-3" /> {place.address}
                    </span>
                  )}
                  {place.notes && <p className="text-sm text-gray-400 mt-1">{place.notes}</p>}
                  {place.adder && <span className="text-xs text-gray-400 mt-1 block">{place.adder.name}</span>}
                </div>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => { setEditingId(place.id); setShowForm(true); }} className="p-1.5 rounded hover:bg-gray-100 text-gray-400">
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button onClick={() => deleteMutation.mutate(place.id)} className="p-1.5 rounded hover:bg-red-50 text-gray-400 hover:text-red-500">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-16 text-gray-500">
          <MapPin className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p>아직 저장된 장소가 없습니다</p>
        </div>
      )}

      {showForm && (
        <PlaceForm
          tripId={id!}
          editingPlace={editingId ? places?.find((p) => p.id === editingId) : undefined}
          onClose={() => { setShowForm(false); setEditingId(null); }}
        />
      )}
    </div>
  );
}

function PlaceForm({ tripId, editingPlace, onClose }: { tripId: string; editingPlace?: Place; onClose: () => void }) {
  const queryClient = useQueryClient();
  const [name, setName] = useState(editingPlace?.name || '');
  const [address, setAddress] = useState(editingPlace?.address || '');
  const [category, setCategory] = useState(editingPlace?.category || '');
  const [notes, setNotes] = useState(editingPlace?.notes || '');
  const [rating, setRating] = useState(editingPlace?.rating || 0);

  const mutation = useMutation({
    mutationFn: async () => {
      const body = {
        name,
        address: address || undefined,
        category: category || undefined,
        notes: notes || undefined,
        rating: rating || undefined,
      };
      if (editingPlace) {
        return api.put(`/trips/${tripId}/places/${editingPlace.id}`, body);
      }
      return api.post(`/trips/${tripId}/places`, body);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['places', tripId] });
      toast.success(editingPlace ? '장소가 수정되었습니다.' : '장소가 추가되었습니다.');
      onClose();
    },
    onError: () => toast.error('장소 저장에 실패했습니다.'),
  });

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl w-full max-w-md p-6" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">{editingPlace ? '장소 수정' : '장소 추가'}</h2>
          <button onClick={onClose} className="p-1 rounded hover:bg-gray-100"><X className="w-5 h-5" /></button>
        </div>
        <form onSubmit={(e) => { e.preventDefault(); mutation.mutate(); }} className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">이름 *</label>
            <input type="text" value={name} onChange={(e) => setName(e.target.value)} required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-navy/20" placeholder="이치란 라멘 도톤보리점" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">주소</label>
            <input type="text" value={address} onChange={(e) => setAddress(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-navy/20" placeholder="오사카시 중앙구..." />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">카테고리</label>
            <select value={category} onChange={(e) => setCategory(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-navy/20">
              <option value="">선택안함</option>
              {CATEGORIES.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">별점</label>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setRating(rating === s ? 0 : s)}
                  className="p-0.5"
                >
                  <Star className={`w-6 h-6 ${s <= rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`} />
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">메모</label>
            <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={2}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-navy/20" placeholder="특이사항, 추천 메뉴 등" />
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 py-2 border border-gray-300 rounded-lg text-gray-600">취소</button>
            <button type="submit" disabled={mutation.isPending} className="flex-1 py-2 bg-navy text-white rounded-lg font-medium disabled:opacity-50">
              {mutation.isPending ? '저장 중...' : '저장'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
