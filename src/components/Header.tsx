import React from 'react';
import { BookOpen, User, LogIn, Menu } from 'lucide-react';
import { useAuthStore } from '../store/authStore';

export default function Header() {
  const { user, isAuthenticated, setShowAuthModal } = useAuthStore();
  const [showMobileMenu, setShowMobileMenu] = React.useState(false);
  const [showProfileMenu, setShowProfileMenu] = React.useState(false);

  return (
    <header className="bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 py-3 sm:py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            <BookOpen className="w-6 h-6 sm:w-8 sm:h-8 text-indigo-600" />
            <div>
              <h1 className="text-base sm:text-xl font-bold text-gray-900 leading-tight">MeinBuch ProtoTyp</h1>
              <p className="text-xs sm:text-sm text-gray-500">Hardcover und Softcover</p>
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center">
            {isAuthenticated ? (
              <div className="relative">
                <button
                  onClick={() => setShowProfileMenu(!showProfileMenu)}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-50"
                >
                  <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center">
                    <User className="w-4 h-4 text-indigo-600" />
                  </div>
                  <span className="text-sm font-medium text-gray-700">{user?.name}</span>
                </button>

                {showProfileMenu && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1">
                    <button
                      onClick={() => {
                        setShowProfileMenu(false);
                        useAuthStore.getState().setShowProfileModal(true);
                      }}
                      className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50"
                    >
                      Profil
                    </button>
                    <button
                      onClick={() => {
                        useAuthStore.getState().logout();
                        setShowProfileMenu(false);
                      }}
                      className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50"
                    >
                      Abmelden
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={() => setShowAuthModal(true)}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700"
              >
                <LogIn className="w-4 h-4" />
                Anmelden
              </button>
            )}
          </nav>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setShowMobileMenu(!showMobileMenu)}
            className="md:hidden p-2 rounded-lg hover:bg-gray-50"
          >
            <Menu className="w-6 h-6 text-gray-600" />
          </button>
        </div>

        {/* Mobile Menu */}
        {showMobileMenu && (
          <div className="md:hidden mt-3 py-3 border-t border-gray-200">
            <nav className="flex flex-col space-y-3">
              {isAuthenticated ? (
                <>
                  <button
                    onClick={() => {
                      setShowMobileMenu(false);
                      useAuthStore.getState().setShowProfileModal(true);
                    }}
                    className="px-2 py-1 text-left text-sm text-gray-600 hover:text-indigo-600"
                  >
                    Profil
                  </button>
                  <button
                    onClick={() => {
                      useAuthStore.getState().logout();
                      setShowMobileMenu(false);
                    }}
                    className="px-2 py-1 text-left text-sm text-red-600 hover:text-red-700"
                  >
                    Abmelden
                  </button>
                </>
              ) : (
                <button
                  onClick={() => {
                    setShowAuthModal(true);
                    setShowMobileMenu(false);
                  }}
                  className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700"
                >
                  <LogIn className="w-4 h-4" />
                  Anmelden
                </button>
              )}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}