import React, { useState, useEffect } from 'react';
import { ArrowLeft, Heart, Users, Clock, MapPin, Phone, Mail } from 'lucide-react';
import { donationService, requestService, type Donation, type Request } from '../lib/supabase';

const Dashboard: React.FC<DashboardProps> = ({ onBack }) => {
  const [donations, setDonations] = useState<Donation[]>([]);
  const [requests, setRequests] = useState<Request[]>([]);
  const [activeTab, setActiveTab] = useState<'donations' | 'requests'>('donations');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      
      try {
        const [donationsData, requestsData] = await Promise.all([
          donationService.getAll(),
          requestService.getAll()
        ]);
        
        setDonations(donationsData || []);
        setRequests(requestsData || []);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'critical': return 'bg-red-100 text-red-800 border-red-200';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusColor = (status: string) => {
    return status === 'matched' || status === 'available' 
      ? 'bg-green-100 text-green-800 border-green-200'
      : 'bg-blue-100 text-blue-800 border-blue-200';
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-96">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        {/* Back Button */}
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-800 mb-8 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          Back to Home
        </button>

        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Dashboard</h1>
          <p className="text-gray-600">Track active donations and requests</p>
        </div>

        {/* Tabs */}
        <div className="flex justify-center mb-8">
          <div className="bg-gray-100 p-1 rounded-xl">
            <button
              onClick={() => setActiveTab('donations')}
              className={`px-6 py-3 rounded-lg font-semibold transition-all ${
                activeTab === 'donations'
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              <Heart className="w-5 h-5 inline mr-2" />
              Donations ({donations.length})
            </button>
            <button
              onClick={() => setActiveTab('requests')}
              className={`px-6 py-3 rounded-lg font-semibold transition-all ${
                activeTab === 'requests'
                  ? 'bg-white text-green-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              <Users className="w-5 h-5 inline mr-2" />
              Requests ({requests.length})
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="grid gap-6">
          {activeTab === 'donations' ? (
            donations.map((donation) => (
              <div key={donation.id} className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-shadow">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <h3 className="text-xl font-bold text-gray-900">{donation.medicine_name}</h3>
                      <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(donation.status)}`}>
                        {donation.status}
                      </span>
                    </div>
                    <div className="grid md:grid-cols-2 gap-4 text-sm text-gray-600">
                      <div className="flex items-center gap-2">
                        <Heart className="w-4 h-4" />
                        <span>Donor: {donation.donor_name}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Phone className="w-4 h-4" />
                        <span>{donation.contact}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">Quantity:</span>
                        <span>{donation.quantity}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4" />
                        <span>Expires: {donation.expiry_date ? new Date(donation.expiry_date).toLocaleDateString() : 'Not specified'}</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-sm text-gray-500">
                    Added {new Date(donation.created_at).toLocaleDateString()}
                  </div>
                </div>
              </div>
            ))
          ) : (
            requests.map((request) => (
              <div key={request.id} className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-shadow">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <h3 className="text-xl font-bold text-gray-900">{request.medicine_name}</h3>
                      <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getUrgencyColor(request.urgency)}`}>
                        {request.urgency} urgency
                      </span>
                      <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(request.status)}`}>
                        {request.status}
                      </span>
                    </div>
                    <div className="grid md:grid-cols-2 gap-4 text-sm text-gray-600">
                      <div className="flex items-center gap-2">
                        <Users className="w-4 h-4" />
                        <span>Requester: {request.requester_name}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Phone className="w-4 h-4" />
                        <span>{request.contact}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4" />
                        <span>{request.location || 'Not specified'}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4" />
                        <span>Requested {new Date(request.created_at).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Empty State */}
        {((activeTab === 'donations' && donations.length === 0) || 
          (activeTab === 'requests' && requests.length === 0)) && (
          <div className="text-center py-12">
            <div className="bg-gray-100 p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
              {activeTab === 'donations' ? (
                <Heart className="w-8 h-8 text-gray-400" />
              ) : (
                <Users className="w-8 h-8 text-gray-400" />
              )}
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              No {activeTab} yet
            </h3>
            <p className="text-gray-600">
              {activeTab === 'donations' 
                ? 'Start by adding your first medicine donation.' 
                : 'Submit a request to find the medicine you need.'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

interface DashboardProps {
  onBack: () => void;
}

export default Dashboard;