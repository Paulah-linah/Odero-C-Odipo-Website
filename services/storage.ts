
import { Book, BlogPost, Order } from '../types';
import type { Event as EventType } from '../types';
import { INITIAL_BOOKS, INITIAL_POSTS, INITIAL_EVENTS } from '../constants';

const KEYS = {
  BOOKS: 'odero_books',
  BLOGS: 'odero_blogs',
  EVENTS: 'odero_events',
  ORDERS: 'odero_orders',
  AUTH: 'odero_auth_session'
};

export const storage = {
  getBooks: (): Book[] => {
    const data = localStorage.getItem(KEYS.BOOKS);
    if (!data) {
      localStorage.setItem(KEYS.BOOKS, JSON.stringify(INITIAL_BOOKS));
      return INITIAL_BOOKS;
    }
    return JSON.parse(data);
  },
  saveBooks: (books: Book[]) => {
    localStorage.setItem(KEYS.BOOKS, JSON.stringify(books));
    window.dispatchEvent(new Event('odero_books_updated'));
  },
  
  getBlogs: (): BlogPost[] => {
    const data = localStorage.getItem(KEYS.BLOGS);
    if (!data) {
      localStorage.setItem(KEYS.BLOGS, JSON.stringify(INITIAL_POSTS));
      return INITIAL_POSTS;
    }
    return JSON.parse(data);
  },
  saveBlogs: (blogs: BlogPost[]) => localStorage.setItem(KEYS.BLOGS, JSON.stringify(blogs)),

  getEvents: (): EventType[] => {
    const data = localStorage.getItem(KEYS.EVENTS);
    if (!data) {
      localStorage.setItem(KEYS.EVENTS, JSON.stringify(INITIAL_EVENTS));
      return INITIAL_EVENTS;
    }
    return JSON.parse(data);
  },
  saveEvents: (events: EventType[]) => localStorage.setItem(KEYS.EVENTS, JSON.stringify(events)),

  getOrders: (): Order[] => {
    const data = localStorage.getItem(KEYS.ORDERS);
    return data ? JSON.parse(data) : [];
  },
  addOrder: (order: Order) => {
    const orders = storage.getOrders();
    orders.push(order);
    localStorage.setItem(KEYS.ORDERS, JSON.stringify(orders));
  },

  setSession: (user: any) => localStorage.setItem(KEYS.AUTH, JSON.stringify(user)),
  getSession: () => {
    const data = localStorage.getItem(KEYS.AUTH);
    return data ? JSON.parse(data) : null;
  },
  clearSession: () => localStorage.removeItem(KEYS.AUTH)
};
