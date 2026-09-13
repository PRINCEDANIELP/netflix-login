// pages/Dashboard.jsx
import React, { useState } from 'react';

const Dashboard = ({ user, onLogout }) => {
  const [hoveredCard, setHoveredCard] = useState(null);

  if (!user) return null;

  const featured = {
    id: 1,
    title: 'Stranger Things',
    description:
      'When a young boy disappears, his friends, family and local police uncover a mystery involving secret government experiments.',
    image: '/stange.jpg',
  };

  const categories = [
    {
      name: 'Trending Now',
      shows: [
        { id: 1, title: 'Daredevil', image: '/Daredevil.jpg' },
        { id: 2, title: 'The Crown', image: '/The Crown.jpg' },
        { id: 3, title: 'Dark', image: '/Dark.jpg' },
        { id: 4, title: 'The Witcher', image: '/The Witcher.jpg' },
      ],
    },
    {
      name: 'Watch It Again',
      shows: [
        { id: 5, title: 'Breaking Bad', image: '/Breaking Bad.jpg' },
        { id: 6, title: 'Friends', image: '/Friends.jpg' },
        { id: 7, title: 'The Office', image: '/The Office.jpg' },
        { id: 8, title: 'Sherlock', image: '/Sherlock.jpg' },
      ],
    },
    {
      name: 'Continue Watching',
      shows: [
        { id: 9, title: 'Inception', image: '/Inception.jpg' },
        { id: 10, title: 'The Matrix', image: '/The Matrix.jpg' },
        { id: 11, title: 'Interstellar', image: '/inesteelar.jpg' },
        { id: 12, title: 'Tenet', image: '/Tenet.jpg' },
      ],
    },
  ];

  return (
    <div className="w-full min-h-screen bg-[#141414] text-white font-['Segoe_UI',Tahoma,Geneva,Verdana,sans-serif]">

      {/* ── Navbar ── */}
      <nav className="sticky top-0 z-50 flex items-center justify-between px-6 md:px-12 py-4 bg-gradient-to-b from-black/70 to-transparent backdrop-blur-md border-b border-white/10">
        {/* Logo */}
        <div className="flex items-center gap-8">
          <a href="#" aria-label="Netflix home" className="inline-block w-[148px] h-[40px] shrink-0">
            <img src="/logo.png" alt="Netflix" className="w-full h-full object-contain" />
          </a>

          {/* Nav links */}
          <ul className="hidden md:flex list-none gap-6">
            {['Home', 'TV Shows', 'Movies', 'New & Popular', 'My List'].map((item, i) => (
              <li key={item}>
                <a
                  href={`#${item.toLowerCase().replace(/\s+/g, '')}`}
                  className={`text-sm font-medium transition-colors duration-300 no-underline relative group ${i === 0 ? 'text-white' : 'text-white/80 hover:text-white'}`}
                >
                  {item}
                  <span className={`absolute -bottom-1 left-0 h-0.5 bg-[#e50914] transition-all duration-300 ${i === 0 ? 'w-full' : 'w-0 group-hover:w-full'}`} />
                </a>
              </li>
            ))}
          </ul>
        </div>

        {/* User profile */}
        <div className="flex items-center gap-3 px-3 py-2 rounded hover:bg-white/10 transition cursor-pointer">
          <div className="w-8 h-8 rounded bg-gradient-to-br from-[#e50914] to-[#b40710] flex items-center justify-center font-bold text-sm shrink-0">
            {user.email[0].toUpperCase()}
          </div>
          <span className="text-sm text-white/80 hidden sm:inline">{user.email}</span>
          <button
            onClick={onLogout}
            className="ml-2 bg-[#e50914] text-white border-none px-3 py-1.5 rounded text-xs font-bold cursor-pointer transition hover:bg-[#ff0a16] hover:scale-105"
          >
            Sign Out
          </button>
        </div>
      </nav>

      {/* ── Featured Section ── */}
      <div className="relative h-[80vh] min-h-[500px] overflow-hidden">
        <div
          className="w-full h-full bg-cover bg-center flex items-end pb-28 md:pb-36 px-8 md:px-12"
          style={{ backgroundImage: `url(${featured.image})` }}
        >
          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#141414] via-[#141414]/40 to-transparent z-[1]" />

          <div className="relative z-[2] max-w-lg animate-[slideUp_0.8s_ease]">
            <h1 className="text-4xl md:text-5xl font-bold mb-4 drop-shadow-[2px_2px_4px_rgba(0,0,0,0.5)]">
              {featured.title}
            </h1>
            <p className="text-base md:text-lg leading-snug mb-6 text-white/90 drop-shadow">
              {featured.description}
            </p>
            <div className="flex gap-4 flex-wrap">
              <button className="flex items-center gap-3 px-8 py-3 bg-white text-black font-bold text-base rounded transition hover:bg-white/75 hover:scale-105 cursor-pointer">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="black"><path d="M8 5v14l11-7z" /></svg>
                Play
              </button>
              <button className="flex items-center gap-3 px-8 py-3 bg-[rgba(109,109,110,0.7)] text-white font-bold text-base rounded transition hover:bg-[rgba(109,109,110,0.4)] hover:scale-105 cursor-pointer">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="white"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" /></svg>
                More Info
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ── Content Rows ── */}
      <div className="px-6 md:px-12 pb-6 -mt-5 relative z-10">
        {categories.map((category) => (
          <div key={category.name} className="mb-10 last:mb-2">
            <h2 className="text-lg md:text-xl font-bold mb-4 tracking-wide">{category.name}</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
              {category.shows.map((show) => (
                <div
                  key={show.id}
                  onMouseEnter={() => setHoveredCard(show.id)}
                  onMouseLeave={() => setHoveredCard(null)}
                  className="relative bg-[#2f2f2f] rounded overflow-hidden cursor-pointer transition-all duration-300 aspect-[2/3] hover:scale-105 hover:shadow-[0_8px_16px_rgba(0,0,0,0.8)] hover:z-10"
                >
                  <img
                    src={show.image}
                    alt={show.title}
                    className="w-full h-full object-cover transition-transform duration-300"
                  />
                  {hoveredCard === show.id && (
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex flex-col justify-end items-start p-4 animate-[fadeIn_0.3s_ease] z-10">
                      <p className="text-sm font-semibold mb-3">{show.title}</p>
                      <div className="flex gap-2 w-full">
                        <button className="flex-1 bg-white/20 border border-white/30 text-white py-2 rounded flex items-center justify-center transition hover:bg-white/30">
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="white"><path d="M8 5v14l11-7z" /></svg>
                        </button>
                        <button className="flex-1 bg-white/20 border border-white/30 text-white py-2 rounded flex items-center justify-center transition hover:bg-white/30">
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="white"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" /></svg>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* ── Footer ── */}
      <footer className="bg-black border-t border-white/10 py-8 px-6 md:px-12 text-center">
        <p className="text-sm text-white/70 mb-5">
          &copy; 2024 Netflix Clone. This is a demo project for educational purposes.
        </p>
        <div className="flex flex-wrap justify-center gap-6 mb-5">
          {['Audio and Subtitles', 'Help Center', 'Jobs', 'Contact Us'].map((link) => (
            <a
              key={link}
              href={`#${link.toLowerCase().replace(/\s+/g, '-')}`}
              className="text-xs text-white/70 hover:text-white transition no-underline"
            >
              {link}
            </a>
          ))}
        </div>
      </footer>

      {/* Keyframe animations */}
      <style>{`
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(30px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
      `}</style>
    </div>
  );
};

export default Dashboard;
