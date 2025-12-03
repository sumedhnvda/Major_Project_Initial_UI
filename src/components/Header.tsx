import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';

const Header = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();
  const isHome = location.pathname === '/';

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

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled || !isHome || isMobileMenuOpen
        ? 'bg-cream-50/95 backdrop-blur-sm shadow-sm py-3'
        : 'bg-transparent py-5'
        }`}
    >
      <div className="container mx-auto px-4 flex justify-between items-center">
        <Link to="/" className="flex items-center gap-2" onClick={closeMobileMenu}>
          <div className="w-10 h-10 bg-light-red-500 rounded-full flex items-center justify-center overflow-hidden">
            <img src="/logo.png" alt="Saraswati Logo" className="h-8 w-8 object-contain" />
          </div>
          <h1
            className="text-xl font-bold text-gray-800 cursor-pointer"
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          >
            ಸರಸ್ವತಿ
          </h1>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:block">
          <ul className="flex gap-8">
            <li><Link to="/" className="text-gray-700 hover:text-light-red-500 transition-colors">Home</Link></li>
            <li><Link to="/contribute" className="text-gray-600 hover:text-light-red-500 font-medium transition-colors">Contribute</Link></li>
            <li><Link to="/data" className="text-gray-600 hover:text-light-red-500 font-medium transition-colors">View Data</Link></li>
            <li><a href="https://arxiv.org/abs/1706.03762" target="_blank" rel="noopener noreferrer" className="text-gray-700 hover:text-light-red-500 transition-colors">Research Paper</a></li>
          </ul>
        </nav>

        <div className="hidden md:block">
          <a
            href="https://github.com/sumedhnvda/sarasvati_TULU_LLM"
            target="_blank"
            rel="noopener noreferrer"
            className="bg-light-red-500 hover:bg-light-red-600 text-white px-5 py-2 rounded-full transition-colors shadow-sm"
          >
            GitHub
          </a>
        </div>

        {/* Mobile Menu Button */}
        <button
          className="md:hidden text-gray-700 focus:outline-none"
          onClick={toggleMobileMenu}
          aria-label="Toggle mobile menu"
        >
          {isMobileMenuOpen ? (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          )}
        </button>
      </div>

      {/* Mobile Navigation Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-cream-50/95 backdrop-blur-sm shadow-lg absolute top-full left-0 right-0 py-4 px-4 flex flex-col gap-4 border-t border-gray-100">
          <Link to="/" className="text-gray-700 hover:text-light-red-500 font-medium py-2 border-b border-gray-100" onClick={closeMobileMenu}>Home</Link>
          <Link to="/contribute" className="text-gray-700 hover:text-light-red-500 font-medium py-2 border-b border-gray-100" onClick={closeMobileMenu}>Contribute</Link>
          <Link to="/data" className="text-gray-700 hover:text-light-red-500 font-medium py-2 border-b border-gray-100" onClick={closeMobileMenu}>View Data</Link>
          <a href="https://arxiv.org/abs/1706.03762" target="_blank" rel="noopener noreferrer" className="text-gray-700 hover:text-light-red-500 font-medium py-2 border-b border-gray-100" onClick={closeMobileMenu}>Research Paper</a>
          <a
            href="https://github.com/sumedhnvda/sarasvati_TULU_LLM"
            target="_blank"
            rel="noopener noreferrer"
            className="bg-light-red-500 hover:bg-light-red-600 text-white px-5 py-2 rounded-full transition-colors shadow-sm text-center w-full block"
            onClick={closeMobileMenu}
          >
            GitHub
          </a>
        </div>
      )}
    </header>
  );
};

export default Header;