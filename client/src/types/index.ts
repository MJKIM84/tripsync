export interface User {
  id: string;
  email: string;
  name: string;
  avatarUrl: string | null;
  bloodType?: string | null;
  allergies?: string | null;
  emergencyContactName?: string | null;
  emergencyContactPhone?: string | null;
  createdAt?: string;
}

export interface Trip {
  id: string;
  ownerId: string;
  title: string;
  description: string | null;
  coverImage: string | null;
  country: string | null;
  city: string | null;
  startDate: string | null;
  endDate: string | null;
  status: 'planning' | 'ongoing' | 'completed';
  tags: string[];
  timezone: string | null;
  createdAt: string;
  updatedAt: string;
  owner?: User;
  members?: TripMember[];
  _count?: {
    members: number;
    photos: number;
    schedules?: number;
    journals?: number;
    budgets?: number;
    checklists?: number;
    documents?: number;
  };
}

export interface TripMember {
  id: string;
  tripId: string;
  userId: string;
  role: 'owner' | 'traveler' | 'guide' | 'family' | 'friend';
  joinedAt: string;
  user: User;
}

export interface Schedule {
  id: string;
  tripId: string;
  dayNumber: number;
  date: string | null;
  title: string;
  description: string | null;
  startTime: string | null;
  endTime: string | null;
  locationName: string | null;
  latitude: number | null;
  longitude: number | null;
  category: string | null;
  sortOrder: number;
  creator?: User;
  createdAt: string;
}

export interface Journal {
  id: string;
  tripId: string;
  authorId: string;
  date: string;
  title: string | null;
  content: string | null;
  mood: string | null;
  locationName: string | null;
  author?: User;
  photos?: Photo[];
  createdAt: string;
}

export interface Photo {
  id: string;
  tripId: string;
  uploaderId: string;
  filePath: string;
  thumbnailPath: string | null;
  mediumPath: string | null;
  fileName: string | null;
  fileSize: number | null;
  mimeType: string | null;
  width: number | null;
  height: number | null;
  caption: string | null;
  locationName: string | null;
  uploader?: User;
  createdAt: string;
}

export interface Place {
  id: string;
  tripId: string;
  name: string;
  address: string | null;
  latitude: number | null;
  longitude: number | null;
  category: string | null;
  notes: string | null;
  rating: number | null;
  adder?: User;
  createdAt: string;
}

export interface Budget {
  id: string;
  tripId: string;
  paidBy: string;
  title: string;
  amount: number;
  currency: string;
  category: string | null;
  date: string | null;
  splitAmong: string[];
  payer?: User;
  createdAt: string;
}

export interface Checklist {
  id: string;
  tripId: string;
  title: string;
  category: string;
  items: ChecklistItem[];
  creator?: User;
}

export interface ChecklistItem {
  id: string;
  checklistId: string;
  title: string;
  isChecked: boolean;
  assignedTo: string | null;
  assignee?: User | null;
  checker?: User | null;
  dueDate: string | null;
  sortOrder: number;
}

export interface Document {
  id: string;
  tripId: string;
  title: string;
  filePath: string;
  fileName: string | null;
  fileSize: number | null;
  mimeType: string | null;
  category: string | null;
  visibility: string;
  uploader?: User;
  createdAt: string;
}

export interface ActivityLog {
  id: string;
  tripId: string;
  userId: string | null;
  action: string;
  targetType: string;
  description: string | null;
  user?: User;
  createdAt: string;
}

export interface Notification {
  id: string;
  userId: string;
  tripId: string | null;
  type: string;
  title: string | null;
  message: string | null;
  isRead: boolean;
  createdAt: string;
}

export interface ChatMessage {
  id: string;
  tripId: string;
  senderId: string;
  content: string | null;
  messageType: string;
  attachmentUrl: string | null;
  replyToId: string | null;
  isPinned: boolean;
  readBy: string[];
  sender?: User;
  replyTo?: ChatMessage | null;
  createdAt: string;
}

export interface Comment {
  id: string;
  tripId: string;
  userId: string;
  targetType: string;
  targetId: string;
  content: string;
  user?: User;
  createdAt: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  pagination?: {
    total?: number;
    hasNext: boolean;
    nextCursor?: string | null;
  };
  error?: {
    code: string;
    message: string;
    status: number;
  };
}
