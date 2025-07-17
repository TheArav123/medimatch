import React from 'react';
import { Heart } from 'lucide-react';

const Header = () => {
  return (
    <header className="bg-white shadow-sm border-b border-gray-100">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-blue-100 p-2 rounded-lg">
              <Heart className="w-6 h-6 text-blue-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900">MediMatch</h1>
          </div>
          <div className="hidden md:flex items-center gap-6">
            <span className="text-sm text-gray-600">Connecting donors with those in need</span>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;