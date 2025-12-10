const Header = () => {
  return (
    <header className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-linear-to-r from-teal-500 to-cyan-500 flex items-center justify-center text-white font-bold">
              P
            </div>
            <span className="text-xl font-bold text-slate-800">Primal Health</span>
          </div>
          <nav className="hidden md:flex items-center gap-8">
            <a href="#" className="text-slate-600 hover:text-teal-600 transition-colors">
              Services
            </a>
            <a href="#" className="text-slate-600 hover:text-teal-600 transition-colors">
              About
            </a>
            <a
              href="mailto:dennis.diaz.tech@gmail.com"
              className="text-slate-600 hover:text-teal-600 transition-colors"
            >
              Contact
            </a>
            <button className="px-4 py-2 bg-linear-to-r from-teal-500 to-cyan-500 text-white rounded-lg font-medium hover:from-teal-600 hover:to-cyan-600 transition-all">
              Book Now
            </button>
          </nav>
        </div>
      </div>
    </header>
  );
};

export default Header;
