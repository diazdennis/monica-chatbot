import ChatWidget from '@/components/widget/ChatWidget';
import Footer from '@/components/Footer';
import Header from '@/components/Header';

const Home = () => {
  return (
    <div className="min-h-screen bg-linear-to-br from-slate-50 to-slate-100">
      <Header />

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold text-slate-800 mb-6">
            Optimize Your Health with
            <span className="text-transparent bg-clip-text bg-linear-to-r from-teal-500 to-cyan-500">
              {' '}
              Precision Medicine
            </span>
          </h1>
          <p className="text-xl text-slate-600 max-w-2xl mx-auto mb-8">
            Get comprehensive bloodwork and personalized health insights to unlock your peak
            performance.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="px-8 py-4 bg-linear-to-r from-teal-500 to-cyan-500 text-white rounded-xl font-semibold hover:from-teal-600 hover:to-cyan-600 transition-all shadow-lg hover:shadow-xl">
              Get Started
            </button>
            <button className="px-8 py-4 bg-white text-slate-700 rounded-xl font-semibold border border-slate-200 hover:border-teal-500 transition-all">
              Learn More
            </button>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-8 mb-16">
          <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 hover:shadow-lg transition-all">
            <div className="w-14 h-14 rounded-xl bg-teal-100 flex items-center justify-center mb-6">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="w-7 h-7 text-teal-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-slate-800 mb-3">Comprehensive Bloodwork</h3>
            <p className="text-slate-600">
              Advanced lab testing with 80+ biomarkers to give you the complete picture of your
              health.
            </p>
          </div>
          <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 hover:shadow-lg transition-all">
            <div className="w-14 h-14 rounded-xl bg-cyan-100 flex items-center justify-center mb-6">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="w-7 h-7 text-cyan-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 10V3L4 14h7v7l9-11h-7z"
                />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-slate-800 mb-3">Hormone Optimization</h3>
            <p className="text-slate-600">
              Personalized hormone therapy protocols to restore energy, focus, and vitality.
            </p>
          </div>
          <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 hover:shadow-lg transition-all">
            <div className="w-14 h-14 rounded-xl bg-indigo-100 flex items-center justify-center mb-6">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="w-7 h-7 text-indigo-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-slate-800 mb-3">Weight Management</h3>
            <p className="text-slate-600">
              Science-backed protocols for sustainable fat loss and body composition optimization.
            </p>
          </div>
        </div>

        {/* CTA Section */}
        <div className="bg-linear-to-r from-teal-500 to-cyan-500 rounded-3xl p-12 text-center text-white">
          <h2 className="text-3xl font-bold mb-4">Ready to Take Control of Your Health?</h2>
          <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
            Chat with Monica, our AI health assistant, to learn more about our services and book
            your consultation.
          </p>
          <p className="text-white/80 text-sm">
            👉 Click the chat button in the bottom right corner to get started!
          </p>
        </div>
      </main>

      <Footer />

      {/* Monica Chat Widget */}
      <ChatWidget position="bottom-right" primaryColor="#14b8a6" clinicName="Primal Health" />
    </div>
  );
};

export default Home;
