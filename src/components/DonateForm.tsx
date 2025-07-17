import React, { useState } from 'react';
import { ArrowLeft, Heart, CheckCircle, AlertCircle } from 'lucide-react';
import { donationService, matchingService, requestService } from '../lib/supabase';

interface DonateFormProps {
  onBack: () => void;
}

interface DonationData {
  donorName: string;
  contact: string;
  medicineName: string;
  quantity: string;
  expiryDate: string;
  description: string;
}

const DonateForm: React.FC<DonateFormProps> = ({ onBack }) => {
  const [formData, setFormData] = useState<DonationData>({
    donorName: '',
    contact: '',
    medicineName: '',
    quantity: '',
    expiryDate: '',
    description: ''
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setMessage(null);

    try {
      // Create donation in database
      const donation = await donationService.create({
        donor_name: formData.donorName,
        contact: formData.contact,
        medicine_name: formData.medicineName,
        quantity: formData.quantity,
        expiry_date: formData.expiryDate || undefined,
        description: formData.description || undefined
      });

      // Check for matching requests
      const matchingRequests = await supabase
        .from('requests')
        .select('*')
        .eq('medicine_name', formData.medicineName)
        .eq('status', 'pending')
        .order('created_at', { ascending: true });

      if (matchingRequests.data && matchingRequests.data.length > 0) {
        // Match with the first (oldest) request
        const matchedRequest = matchingRequests.data[0];
        await matchingService.processMatch(donation.id, matchedRequest.id);
        
        setMessage({
          type: 'success',
          text: `Great! Your donation has been matched with ${matchedRequest.requester_name}. Both parties will receive contact details via email shortly.`
        });
      } else {
        setMessage({
          type: 'success',
          text: 'Thank you! Your medicine donation has been registered. We\'ll notify you if someone needs it.'
        });
      }
      
      // Reset form
      setFormData({
        donorName: '',
        contact: '',
        medicineName: '',
        quantity: '',
        expiryDate: '',
        description: ''
      });
    } catch (error) {
      console.error('Error submitting donation:', error);
      setMessage({
        type: 'error',
        text: 'Failed to submit donation. Please check your connection and try again.'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
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
          <div className="bg-blue-100 p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
            <Heart className="w-8 h-8 text-blue-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Donate Medicine</h1>
          <p className="text-gray-600">Help someone in need by sharing your unused medications</p>
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
                <label htmlFor="donorName" className="block text-sm font-semibold text-gray-700 mb-2">
                  Your Name *
                </label>
                <input
                  type="text"
                  id="donorName"
                  name="donorName"
                  required
                  value={formData.donorName}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
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
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
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
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder="e.g., Paracetamol, Ibuprofen"
                />
              </div>

              <div>
                <label htmlFor="quantity" className="block text-sm font-semibold text-gray-700 mb-2">
                  Quantity *
                </label>
                <input
                  type="text"
                  id="quantity"
                  name="quantity"
                  required
                  value={formData.quantity}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder="e.g., 20 tablets, 100ml"
                />
              </div>
            </div>

            <div>
              <label htmlFor="expiryDate" className="block text-sm font-semibold text-gray-700 mb-2">
                Expiry Date
              </label>
              <input
                type="date"
                id="expiryDate"
                name="expiryDate"
                value={formData.expiryDate}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              />
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-semibold text-gray-700 mb-2">
                Additional Information
              </label>
              <textarea
                id="description"
                name="description"
                rows={4}
                value={formData.description}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
                placeholder="Any additional details about the medicine (condition, dosage, etc.)"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-blue-600 text-white py-4 rounded-xl font-semibold hover:bg-blue-700 disabled:bg-blue-400 transition-all duration-200 transform hover:scale-105 shadow-lg disabled:transform-none"
            >
              {isSubmitting ? 'Submitting...' : 'Donate Medicine'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default DonateForm;