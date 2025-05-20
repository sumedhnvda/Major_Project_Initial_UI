import React from 'react';

const people = [
  { name: "Sumedh Navuda", url: "https://www.linkedin.com/in/sumedhnavuda/" },
  { name: "Vikas Salian", url: "https://www.linkedin.com/in/vikas-salian/" },
  { name: "Sudharshan", url: "https://www.linkedin.com/in/sudharshan/" },
  { name: "Swathik", url: "http://linkedin.com/in/swasthik-k-710667274" },
];

const guide = { name: "Ragavendra Sir", url: "https://www.linkedin.com/in/raghavendra/" };

const Footer = () => {
  return (
    <footer className="bg-cream-300 py-10">
      <div className="container mx-auto px-4 flex flex-col items-center">
        {/* Large Logo */}
        <div className="mb-4">
          <div className="w-24 h-24 bg-light-red-500 rounded-full flex items-center justify-center overflow-hidden shadow-lg">
            <img src="/logo.png" alt="Saraswati Logo" className="h-20 w-20 object-contain" />
          </div>
        </div>
        {/* Project Name */}
        <h2 className="text-3xl font-bold text-light-red-500 mb-3">ಸರಸ್ವತಿ</h2>
        {/* Built by */}
        <p className="text-gray-700 mb-2 text-lg">
          Built with <span className="text-light-red-500">♥</span> by{' '}
          {people.map((person, idx) => (
            <span key={person.name}>
              <a
                href={person.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#800000] hover:underline font-semibold"
              >
                {person.name}
              </a>
              {idx < people.length - 1 && ', '}
            </span>
          ))}
        </p>
        {/* Guide */}
        <p className="text-gray-700 mb-2 text-lg">
          Project Guide:{' '}
          <a
            href={guide.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[#800000] hover:underline font-semibold"
          >
            {guide.name}
          </a>
        </p>
        {/* College */}
        <p className="text-gray-700 text-base mt-2">
          Built at SMVITM Bantakal for the World
        </p>
      </div>
    </footer>
  );
};

export default Footer;