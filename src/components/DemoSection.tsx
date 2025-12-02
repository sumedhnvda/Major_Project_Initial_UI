import React from 'react';
import ChatInterface from './ChatInterface';

const DemoSection = () => {
  return (
    <section id="demo" className="py-16 md:py-24 bg-cream-200">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">Try It Yourself</h2>
            <p className="text-gray-600 max-w-xl mx-auto">
              Experience our Tulu language AI model in action. Chat with Saraswati to generate Tulu text.
            </p>
          </div>

          <div className="shadow-xl">
            <ChatInterface />
          </div>
        </div>
      </div>
    </section>
  );
};

export default DemoSection;