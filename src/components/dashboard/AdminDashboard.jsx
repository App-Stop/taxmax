const imgLogo = "/figma/b888a9396e41ae8b3746258887ab3eadbe9402d1.svg";

// Placeholder landing for the admin role until the admin dashboard design is implemented.
export default function AdminDashboard({ user, onLogout, onBackToHome }) {
  return (
    <div className="min-h-screen bg-[#07152a] text-white font-['Manrope',sans-serif]">
      <header className="sticky top-0 z-40 bg-[#0d1d35]/95 backdrop-blur-md border-b border-white/10 px-4 sm:px-8 py-3.5 shadow-md">
        <div className="max-w-[1600px] mx-auto flex items-center justify-between">
          <div className="flex items-center gap-6 sm:gap-8">
            <button
              onClick={onBackToHome}
              className="h-8 sm:h-9 w-auto hover:opacity-85 transition-opacity cursor-pointer"
              title="Return to Home"
            >
              <img src={imgLogo} alt="TAXMAX" className="h-full w-auto object-contain" />
            </button>
            <span className="hidden md:inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-[#0094c5]/20 text-[#0094c5] border border-[#0094c5]/30">
              Admin Portal
            </span>
          </div>
          <button
            type="button"
            onClick={onLogout}
            className="text-xs sm:text-sm text-gray-300 hover:text-white px-3 py-2 rounded-lg hover:bg-white/5 transition-colors cursor-pointer"
          >
            Log Out
          </button>
        </div>
      </header>

      <main className="max-w-[1600px] mx-auto px-4 sm:px-8 py-10">
        <h1 className="text-2xl font-extrabold">Admin dashboard</h1>
        <p className="mt-2 text-sm text-gray-300">
          Signed in as {user?.fullName || 'Admin Staff'} {user?.email ? `(${user.email})` : ''}
        </p>
      </main>
    </div>
  );
}
