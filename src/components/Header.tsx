import React, { useState, useEffect } from 'react';
const Header = () => {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const isScrolled = window.scrollY > 10;
      if (isScrolled !== scrolled) {
        setScrolled(isScrolled);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [scrolled]);

  return (
    <header 
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled 
          ? 'bg-cream-50/95 backdrop-blur-sm shadow-sm py-3' 
          : 'bg-transparent py-5'
      }`}
    >
      <div className="container mx-auto px-4 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 bg-light-red-500 rounded-full flex items-center justify-center overflow-hidden">
            <img src="/logo.png" alt="Saraswati Logo" className="h-8 w-8 object-contain" />
          </div>
          <h1
            className="text-xl font-bold text-gray-800 cursor-pointer"
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          >
            ಸರಸ್ವತಿ
          </h1>
        </div>
        
        <nav className="hidden md:block">
          <ul className="flex gap-8">
            <li><a href="#features" className="text-gray-700 hover:text-light-red-500 transition-colors">Features</a></li>
            <li><a href="#demo" className="text-gray-700 hover:text-light-red-500 transition-colors">Demo</a></li>
            <li><a href="https://arxiv.org/abs/1706.03762" target="_blank" rel="noopener noreferrer" className="text-gray-700 hover:text-light-red-500 transition-colors">Research Paper</a></li>
          </ul>
        </nav>
        
        <a 
          href="https://github.com/sumedhnvda/sarasvati_TULU_LLM" 
          target="_blank" 
          rel="noopener noreferrer" 
          className="bg-light-red-500 hover:bg-light-red-600 text-white px-5 py-2 rounded-full transition-colors shadow-sm"
        >
          GitHub
        </a>
      </div>
    </header>
  );
};

export default Header;