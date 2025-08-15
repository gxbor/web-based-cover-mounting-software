import React from 'react';
import BookConfigurator from './components/BookConfigurator';
import Header from './components/Header';
import AuthModal from './components/AuthModal';
import ProfileOverview from './components/ProfileOverview';
import CookieConsent from './components/CookieConsent';
import { useAuthStore } from './store/authStore';
import { getConsentStatus } from './utils/cookies';
import { Lock } from 'lucide-react';

function App() {
  const [showCookieConsent, setShowCookieConsent] = React.useState(!getConsentStatus());
  const { showAuthModal, setShowAuthModal, showProfileModal, setShowProfileModal, isAuthenticated, isLoading, initializeAuthListener } = useAuthStore();

  React.useEffect(() => {
    // Initialize the auth listener when the app starts
    initializeAuthListener();
  }, [initializeAuthListener]);

  const handleCookieAccept = () => {
    setShowCookieConsent(false);
  };

  const handleCookieDecline = () => {
    setShowCookieConsent(false);
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />

      <main className="flex-1">
        {isLoading ? (
          <div className="min-h-[80vh] flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
          </div>
        ) : isAuthenticated ? (
          <BookConfigurator />
        ) : (
          <div className="min-h-[80vh] flex flex-col items-center justify-center px-4">
            <div className="text-center max-w-md">
              <div className="mb-6 inline-flex items-center justify-center w-16 h-16 rounded-full bg-indigo-100">
                <Lock className="w-8 h-8 text-indigo-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Authentifizierung notwendig</h2>
              <p className="text-gray-600 mb-6">
                Bitte anmelden oder registrieren.
              </p>
              <button
                onClick={() => setShowAuthModal(true)}
                className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
              >
                Anmelden/Registrieren
              </button>
            </div>
          </div>
        )}
      </main>

      {/* Modals */}
      {showCookieConsent && (
        <CookieConsent
          onAccept={handleCookieAccept}
          onDecline={handleCookieDecline}
        />
      )}

      {showAuthModal && (
        <AuthModal onClose={() => setShowAuthModal(false)} />
      )}

      {showProfileModal && (
        <ProfileOverview onClose={() => setShowProfileModal(false)} />
      )}
    </div>
  );
}

export default App;