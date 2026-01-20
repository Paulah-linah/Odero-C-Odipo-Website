
import { Book, BookStatus, BlogPost, Event } from './types';

export const INITIAL_BOOKS: Book[] = [
  {
    id: '1',
    title: 'Mum & Baba',
    slug: 'mum-and-baba',
    synopsis: 'A reflective memoir exploring the intricate tapestry of family, identity, and the quiet moments that define our lineage. Through sparse prose and intimate storytelling, Odero navigates the echoes of the past.',
    price: 1200,
    status: BookStatus.AVAILABLE,
    coverImage: 'https://picsum.photos/seed/book1/400/600',
    publishedDate: '2023-10-15',
    isFeatured: true
  },
  {
    id: '2',
    title: 'The Silent Whispers',
    slug: 'silent-whispers',
    synopsis: 'A collection of poems that speak to the soul of the wanderer. Coming in 2024.',
    price: 1200,
    status: BookStatus.COMING_SOON,
    coverImage: 'https://picsum.photos/seed/book2/400/600',
    publishedDate: '2024-05-20'
  }
];

export const INITIAL_POSTS: BlogPost[] = [
  {
    id: '1',
    title: 'The Art of Remembering',
    slug: 'art-of-remembering',
    content: '<p>Memory is a fickle thing. It selects and discards without our permission...</p>',
    author: 'Odipo C. Odero',
    publishedDate: '2024-01-10',
    category: 'Reflections',
    tags: ['writing', 'memory'],
    status: 'Published'
  }
];

export const INITIAL_EVENTS: Event[] = [
  {
    id: '1',
    title: 'Book Signing: Mum & Baba',
    date: '2024-03-15',
    location: 'Alliance Française, Nairobi',
    description: 'Join us for an evening of readings and discussions on the themes of memory and family.',
    isPast: false,
    isVisible: true
  }
];

export const STICK_FIGURE_PLACEHOLDER = "https://picsum.photos/seed/sketch/600/400?grayscale";
