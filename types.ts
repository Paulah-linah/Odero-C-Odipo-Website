
export enum BookStatus {
  AVAILABLE = 'Available',
  COMING_SOON = 'Coming Soon',
  PRE_ORDER = 'Pre-order',
  DRAFT = 'Draft'
}

export interface Book {
  id: string;
  title: string;
  slug: string;
  synopsis: string;
  price: number;
  status: BookStatus;
  coverImage: string;
  publishedDate: string;
  isFeatured?: boolean;
}

export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  content: string;
  author: string;
  publishedDate: string;
  category: string;
  tags: string[];
  status: 'Draft' | 'Published';
}

export interface Event {
  id: string;
  title: string;
  date: string;
  location: string;
  description: string;
  isPast: boolean;
  isVisible: boolean;
}

export interface User {
  id: string;
  username: string;
  role: 'admin';
}

export interface Order {
  id: string;
  bookId: string;
  customerName: string;
  customerEmail: string;
  amount: number;
  status: 'Pending' | 'Completed';
  createdAt: string;
}
