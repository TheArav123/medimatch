import React, { useState } from 'react';
import { ArrowLeft, Users, CheckCircle, AlertCircle } from 'lucide-react';
import { requestService, matchingService, supabase } from '../lib/supabase';

interface RequestFormProps {
  onBack: () => void;
}

interface RequestData {
  requesterName: string;
  contact: string;
  medicineName: string;
  urgency: string;
  reason: string;
  location: string;
}

const RequestForm: React.FC<RequestFormProps> = ({ onBack }) => {
  const [formData, setFormData] = useState<RequestData>({
    requesterName: '',
    contact: '',
    medicineName: '',
    urgency: '',
    reason: '',
    location: ''
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setMessage(null);

    try {
      // Create request in database
      const request = await requestService.create({
        requester_name: formData.requesterName,
        contact: formData.contact,
        medicine_name: formData.medicineName,
        urgency: formData.urgency as 'low' | 'medium' | 'high' | 'critical',
        reason: formData.reason || undefined,
        location: formData.location || undefined
      });

      // Check for matching donations
      const matchingDonations = await supabase
        .from('donations')
        .select('*')
        .eq('medicine_name', formData.medicineName)
        .eq('status', 'available')
        .order('created_at', { ascending: true });

      if (matchingDonations.data && matchingDonations.data.length > 0) {
        // Match with the first (oldest) donation
        const matchedDonation = matchingDonations.data[0];
        await matchingService.processMatch(matchedDonation.id, request.id);
        
        setMessage({
          type: 'success',
          text: `Great news! We found a matching donor (${matchedDonation.donor_name}). Both parties will receive contact details via email shortly.`
        });
      } else {
        setMessage({
          type: 'success',
          text: 'Your request has been registered. We\'ll notify you as soon as a matching donation becomes available.'
        });
      }
      
      // Reset form
      setFormData({
        requesterName: '',
        contact: '',
        medicineName: '',
        urgency: '',
        reason: '',
        location: ''
      });
    } catch (error) {
      console.error('Error submitting request:', error);
      setMessage({
        type: 'error',
        text: 'Failed to submit request. Please check your connection and try again.'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto">
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
          <div className="bg-green-100 p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
            <Users className="w-8 h-8 text-green-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Request Medicine</h1>
          <p className="text-gray-600">Find the medications you need from generous donors</p>
        </div>

        {/* Form */}
        <div className="bg-white rounded-2xl shadow-lg p-8">
          {message && (
            <div className={`mb-6 p-4 rounded-xl flex items-center gap-3 ${
              message.type === 'success' 
                ? 'bg-green-50 text-green-800 border border-green-200' 
                : 'bg-red-50 text-red-800 border border-red-200'
            }`}>
              {message.type === 'success' ? (
                <CheckCircle className="w-5 h-5" />
              ) : (
                <AlertCircle className="w-5 h-5" />
              )}
              {message.text}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="requesterName" className="block text-sm font-semibold text-gray-700 mb-2">
                  Your Name *
                </label>
                <input
                  type="text"
                  id="requesterName"
                  name="requesterName"
                  required
                  value={formData.requesterName}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                  placeholder="Enter your full name"
                />
              </div>

              <div>
                <label htmlFor="contact" className="block text-sm font-semibold text-gray-700 mb-2">
                  Contact Information *
                </label>
                <input
                  type="text"
                  id="contact"
                  name="contact"
                  required
                  value={formData.contact}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                  placeholder="Phone number or email"
                />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="medicineName" className="block text-sm font-semibold text-gray-700 mb-2">
                  Medicine Name *
                </label>
                <input
                  type="text"
                  id="medicineName"
                  name="medicineName"
                  required
                  value={formData.medicineName}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                  placeholder="e.g., Paracetamol, Ibuprofen"
                />
              </div>

              <div>
                <label htmlFor="urgency" className="block text-sm font-semibold text-gray-700 mb-2">
                  Urgency Level *
                </label>
                <select
                  id="urgency"
                  name="urgency"
                  required
                  value={formData.urgency}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                >
                  <option value="">Select urgency</option>
                  <option value="low">Low - Can wait a week</option>
                  <option value="medium">Medium - Needed within 3 days</option>
                  <option value="high">High - Needed within 24 hours</option>
                  <option value="critical">Critical - Urgent</option>
                </select>
              </div>
            </div>

            <div>
              <label htmlFor="location" className="block text-sm font-semibold text-gray-700 mb-2">
                Your Location
              </label>
              <input
                type="text"
                id="location"
                name="location"
                value={formData.location}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                placeholder="City or area (helps with local matching)"
              />
            </div>

            <div>
              <label htmlFor="reason" className="block text-sm font-semibold text-gray-700 mb-2">
                Reason for Request
              </label>
              <textarea
                id="reason"
                name="reason"
                rows={4}
                value={formData.reason}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all resize-none"
                placeholder="Brief description of why you need this medicine (optional but helps donors)"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-green-600 text-white py-4 rounded-xl font-semibold hover:bg-green-700 disabled:bg-green-400 transition-all duration-200 transform hover:scale-105 shadow-lg disabled:transform-none"
            >
              {isSubmitting ? 'Submitting...' : 'Submit Request'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default RequestForm;