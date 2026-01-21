import React, { useState } from 'react';

export const Blog: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState('all');

  const categories = ['all', 'writing', 'literature', 'social commentary', 'personal reflections'];
  
  const blogPosts = [
    {
      id: 1,
      title: 'The Art of Literary Intimacy',
      excerpt: 'Exploring how writers create deep connections with readers through vulnerable storytelling and authentic voice.',
      category: 'writing',
      date: 'January 15, 2026',
      readTime: '5 min read',
      featured: true
    },
    {
      id: 2,
      title: 'Nairobi Stories: Urban Narratives',
      excerpt: 'The city as character: how Nairobi\'s diverse neighborhoods and cultures shape contemporary Kenyan literature.',
      category: 'literature',
      date: 'January 10, 2026',
      readTime: '7 min read',
      featured: false
    },
    {
      id: 3,
      title: 'Writing as Social Commentary',
      excerpt: 'The responsibility of authors to reflect social realities while maintaining artistic integrity and hope.',
      category: 'social commentary',
      date: 'January 5, 2026',
      readTime: '6 min read',
      featured: false
    },
    {
      id: 4,
      title: 'Finding Voice in Silence',
      excerpt: 'Personal reflections on the spaces between words and how they often carry more meaning than the words themselves.',
      category: 'personal reflections',
      date: 'December 28, 2025',
      readTime: '4 min read',
      featured: false
    },
    {
      id: 5,
      title: 'The Craft of Character Development',
      excerpt: 'Building believable characters that resonate with readers while serving the narrative\'s deeper themes.',
      category: 'writing',
      date: 'December 20, 2025',
      readTime: '8 min read',
      featured: false
    },
    {
      id: 6,
      title: 'Literature and Social Change',
      excerpt: 'Examining how stories have historically driven social progress and continue to shape our collective consciousness.',
      category: 'social commentary',
      date: 'December 15, 2025',
      readTime: '6 min read',
      featured: false
    }
  ];

  const filteredPosts = selectedCategory === 'all' 
    ? blogPosts 
    : blogPosts.filter(post => post.category === selectedCategory);

  const featuredPost = blogPosts.find(post => post.featured);

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="py-20 px-6 md:px-12 max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h1 className="text-5xl font-serif font-bold mb-6 italic">Blog Archive</h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed">
            Thoughts on writing, literature, and the spaces between words. Exploring the craft and consciousness of storytelling.
          </p>
        </div>
      </section>

      {/* Featured Post */}
      {featuredPost && (
        <section className="py-12 px-6 md:px-12 bg-gray-50">
          <div className="max-w-7xl mx-auto">
            <div className="bg-white border border-black p-8 md:p-12">
              <div className="flex items-center justify-between mb-4">
                <span className="bg-black text-white px-3 py-1 text-xs uppercase tracking-widest font-bold">Featured</span>
                <span className="text-sm text-gray-500">{featuredPost.readTime}</span>
              </div>
              <h2 className="text-3xl font-serif font-bold mb-4 italic">{featuredPost.title}</h2>
              <p className="text-gray-600 leading-relaxed mb-6">{featuredPost.excerpt}</p>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">{featuredPost.date}</span>
                <button className="bg-black text-white px-6 py-2 text-sm uppercase tracking-widest font-bold hover:bg-gray-800 transition-colors">
                  Read More
                </button>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Category Filter */}
      <section className="py-8 px-6 md:px-12 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-wrap justify-center gap-4">
            {categories.map(category => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-6 py-2 text-sm uppercase tracking-widest font-bold transition-colors ${
                  selectedCategory === category
                    ? 'bg-black text-white'
                    : 'border border-black hover:bg-black hover:text-white'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Blog Posts Grid */}
      <section className="py-12 px-6 md:px-12 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredPosts.map(post => (
              <article key={post.id} className="bg-white border border-black p-6 hover:shadow-lg transition-shadow">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs uppercase tracking-widest text-gray-500">{post.category}</span>
                  <span className="text-xs text-gray-500">{post.readTime}</span>
                </div>
                <h3 className="text-xl font-serif font-bold mb-3 italic">{post.title}</h3>
                <p className="text-gray-600 leading-relaxed mb-4">{post.excerpt}</p>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">{post.date}</span>
                  <button className="text-sm font-bold uppercase tracking-widest hover:text-black transition-colors">
                    Read More →
                  </button>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Newsletter Section */}
      <section className="py-16 px-6 md:px-12 bg-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-2xl font-serif font-bold mb-8 italic">Stay Connected</h2>
          <p className="text-gray-600 mb-8">
            Subscribe to receive updates on new posts, writing insights, and literary reflections.
          </p>
          <div className="max-w-md mx-auto">
            <form className="flex flex-col sm:flex-row gap-4">
              <input
                type="email"
                placeholder="your.email@example.com"
                className="flex-1 border-b-2 border-black p-3 focus:outline-none"
                required
              />
              <button
                type="submit"
                className="bg-black text-white px-6 py-3 uppercase text-sm font-bold tracking-widest hover:bg-gray-800 transition-colors"
              >
                Subscribe
              </button>
            </form>
          </div>
        </div>
      </section>
    </div>
  );
};
