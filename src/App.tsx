import React, { useState } from 'react';
import { Heart, Users, MessageSquare, ChevronRight } from 'lucide-react';
import Header from './components/Header';
import DonateForm from './components/DonateForm';
import RequestForm from './components/RequestForm';
import Dashboard from './components/Dashboard';

type View = 'home' | 'donate' | 'request' | 'dashboard';

function App() {
  const [currentView, setCurrentView] = useState<View>('home');

  const renderView = () => {
    switch (currentView) {
      case 'donate':
        return <DonateForm onBack={() => setCurrentView('home')} />;
      case 'request':
        return <RequestForm onBack={() => setCurrentView('home')} />;
      case 'dashboard':
        return <Dashboard onBack={() => setCurrentView('home')} />;
      default:
        return <HomePage setView={setCurrentView} />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50">
      <Header />
      {renderView()}
    </div>
  );
}

function HomePage({ setView }: { setView: (view: View) => void }) {
  return (
    <div className="container mx-auto px-4 py-12">
      {/* Hero Section */}
      <div className="text-center mb-16">
        <div className="flex justify-center mb-6">
          <div className="bg-blue-100 p-4 rounded-full">
            <Heart className="w-12 h-12 text-blue-600" />
          </div>
        </div>
        <h1 className="text-5xl font-bold text-gray-900 mb-6">
          Connect Medicine Donors with Those in Need
        </h1>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
          MediMatch bridges the gap between people who have unused medications and those who need them. 
          Our platform automatically matches requests with available donations and connects both parties instantly.
        </p>
      </div>

      {/* Action Cards */}
      <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto mb-16">
        <ActionCard
          icon={<Heart className="w-8 h-8 text-white" />}
          title="Donate Medicine"
          description="Share your unused medications with people who need them"
          buttonText="Start Donating"
          buttonColor="bg-blue-600 hover:bg-blue-700"
          onClick={() => setView('donate')}
        />
        <ActionCard
          icon={<Users className="w-8 h-8 text-white" />}
          title="Request Medicine"
          description="Find the medications you need from generous donors"
          buttonText="Make Request"
          buttonColor="bg-green-600 hover:bg-green-700"
          onClick={() => setView('request')}
        />
      </div>

      {/* Stats Section */}
      <div className="bg-white rounded-2xl shadow-lg p-8 max-w-4xl mx-auto mb-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
          <div>
            <div className="text-3xl font-bold text-blue-600 mb-2">50+</div>
            <div className="text-gray-600">Successful Matches</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-green-600 mb-2">125+</div>
            <div className="text-gray-600">Medicine Donations</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-orange-600 mb-2">200+</div>
            <div className="text-gray-600">People Helped</div>
          </div>
        </div>
      </div>

      {/* View Dashboard */}
      <div className="text-center">
        <button
          onClick={() => setView('dashboard')}
          className="inline-flex items-center gap-2 bg-gray-900 text-white px-8 py-4 rounded-xl font-semibold hover:bg-gray-800 transition-all duration-200 transform hover:scale-105 shadow-lg"
        >
          <MessageSquare className="w-5 h-5" />
          View Active Donations & Requests
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}

function ActionCard({ 
  icon, 
  title, 
  description, 
  buttonText, 
  buttonColor, 
  onClick 
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  buttonText: string;
  buttonColor: string;
  onClick: () => void;
}) {
  return (
    <div className="bg-white rounded-2xl shadow-lg p-8 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
      <div className={`${buttonColor.split(' ')[0]} w-16 h-16 rounded-xl flex items-center justify-center mb-6`}>
        {icon}
      </div>
      <h3 className="text-2xl font-bold text-gray-900 mb-4">{title}</h3>
      <p className="text-gray-600 mb-8 leading-relaxed">{description}</p>
      <button
        onClick={onClick}
        className={`w-full ${buttonColor} text-white py-4 rounded-xl font-semibold transition-all duration-200 transform hover:scale-105 shadow-md`}
      >
        {buttonText}
      </button>
    </div>
  );
}

export default App;