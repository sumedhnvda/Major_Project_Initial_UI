import React from 'react';
import { MessageSquare } from 'lucide-react';

const Hero = () => {
  const scrollToDemo = () => {
    const demoSection = document.getElementById('demo');
    if (demoSection) {
      demoSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section className="pt-28 pb-16 md:pt-40 md:pb-24 relative overflow-hidden">
      <div className="absolute top-40 -left-24 w-64 h-64 bg-light-red-100 rounded-full opacity-50 blur-3xl"></div>
      <div className="absolute bottom-20 -right-32 w-80 h-80 bg-accent-100 rounded-full opacity-30 blur-3xl"></div>

      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-800 mb-6">
            <span className="text-light-red-500">ಸರಸ್ವತಿ</span>
            <br />Tulu Language AI
          </h1>

          <p className="text-lg md:text-xl text-gray-600 mb-8 leading-relaxed">
            Experience natural conversations in Tulu with our advanced AI model.
            Built and pre-trained from scratch for authentic Tulu language interaction.
          </p>

          <div className="flex flex-wrap justify-center gap-4 mb-12">
            <button
              onClick={() => scrollToDemo(true)}
              className="bg-light-red-500 hover:bg-light-red-600 text-white px-8 py-3 rounded-full transition-colors shadow-md flex items-center gap-2"
            >
              <MessageSquare className="h-5 w-5" />
              Start Chatting
            </button>
          </div>

          <div className="flex justify-center gap-10 mb-8">
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 bg-cream-200 rounded-full flex items-center justify-center mb-3">
                <MessageSquare className="h-7 w-7 text-light-red-500" />
              </div>
              <p className="text-gray-700">Ask</p>
            </div>

            <div className="flex items-center">
              <div className="w-10 h-0.5 bg-gray-300"></div>
              <div className="w-3 h-3 bg-light-red-400 rounded-full"></div>
              <div className="w-10 h-0.5 bg-gray-300"></div>
            </div>

            <div className="flex flex-col items-center">
              <div className="w-16 h-16 bg-cream-200 rounded-full flex items-center justify-center mb-3">
                <div className="relative">
                  <div className="absolute inset-0 bg-light-red-100 rounded-full animate-pulse"></div>
                  <MessageSquare className="h-7 w-7 text-light-red-500 relative z-10" />
                </div>
              </div>
              <p className="text-gray-700">Receive</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;