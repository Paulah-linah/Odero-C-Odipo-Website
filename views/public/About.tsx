import React from 'react';

export const About: React.FC = () => {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="py-20 px-6 md:px-12 max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h1 className="text-5xl font-serif font-bold mb-6 italic">The Author's Journey</h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed">
            Exploring the silence between words. A Nairobi-based author dedicated to literary intimacy and storytelling.
          </p>
        </div>
      </section>

      {/* Author Bio Section */}
      <section className="py-16 px-6 md:px-12 bg-gray-50">
        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-serif font-bold mb-6 italic">Odipo C. Odero</h2>
              <p className="text-gray-600 leading-relaxed mb-6">
                Odipo C. Odero is a Nairobi-based author whose work explores the intricate landscapes of human experience through 
                intimate storytelling and poetic prose. With a keen eye for detail and a deep understanding of the human condition, 
                Odipo crafts narratives that resonate with readers on both emotional and intellectual levels.
              </p>
              <p className="text-gray-600 leading-relaxed mb-6">
                His writing journey began with a simple observation: stories are the threads that connect us all. 
                This philosophy permeates his work, creating pieces that serve as bridges between diverse experiences and perspectives.
              </p>
              <p className="text-gray-600 leading-relaxed">
                Whether exploring themes of love, loss, identity, or social change, Odipo approaches each subject with 
                nuance, empathy, and a distinctive voice that is both accessible and profound.
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-64 h-64 bg-gray-200 rounded-full mx-auto mb-6 flex items-center justify-center">
                <span className="text-gray-500 text-sm">Author Photo</span>
              </div>
              <div className="text-left space-y-4">
                <div>
                  <h3 className="font-bold text-lg mb-2">Literary Focus</h3>
                  <p className="text-gray-600">Contemporary fiction, social commentary, literary essays</p>
                </div>
                <div>
                  <h3 className="font-bold text-lg mb-2">Writing Style</h3>
                  <p className="text-gray-600">Intimate, observational, poetic prose with social consciousness</p>
                </div>
                <div>
                  <h3 className="font-bold text-lg mb-2">Themes</h3>
                  <p className="text-gray-600">Identity, connection, social change, human resilience</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Philosophy Section */}
      <section className="py-20 px-6 md:px-12 bg-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-serif font-bold mb-12 italic">Writing Philosophy</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-gray-50 border border-black p-8">
              <h3 className="text-xl font-serif font-bold mb-4">Literary Intimacy</h3>
              <p className="text-gray-600">
                Creating spaces where readers can connect deeply with characters and their emotional journeys.
              </p>
            </div>
            <div className="bg-gray-50 border border-black p-8">
              <h3 className="text-xl font-serif font-bold mb-4">Social Consciousness</h3>
              <p className="text-gray-600">
                Exploring how individual stories reflect broader social patterns and collective experiences.
              </p>
            </div>
            <div className="bg-gray-50 border border-black p-8">
              <h3 className="text-xl font-serif font-bold mb-4">Narrative Bridges</h3>
              <p className="text-gray-600">
                Building connections between diverse perspectives through shared human experiences.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-16 px-6 md:px-12 bg-gray-50">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-2xl font-serif font-bold mb-8 italic">Connect with the Author</h2>
          <p className="text-lg text-gray-600 mb-8">
            Interested in discussing literature, collaborations, or sharing your own story? Let's connect.
          </p>
          <div className="flex justify-center space-x-4">
            <a 
              href="/#/contact" 
              className="bg-black text-white px-8 py-3 uppercase text-sm font-bold tracking-widest hover:bg-gray-800 transition-colors"
            >
              Get in Touch
            </a>
            <a 
              href="/#/books" 
              className="border border-black px-8 py-3 uppercase text-sm font-bold tracking-widest hover:bg-black hover:text-white transition-colors"
            >
              Explore Books
            </a>
          </div>
        </div>
      </section>
    </div>
  );
};
