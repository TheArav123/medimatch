import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Types for our database tables
export interface Donation {
  id: string;
  donor_name: string;
  contact: string;
  medicine_name: string;
  quantity: string;
  expiry_date?: string;
  description?: string;
  status: 'available' | 'matched';
  created_at: string;
  updated_at: string;
}

export interface Request {
  id: string;
  requester_name: string;
  contact: string;
  medicine_name: string;
  urgency: 'low' | 'medium' | 'high' | 'critical';
  reason?: string;
  location?: string;
  status: 'pending' | 'matched';
  created_at: string;
  updated_at: string;
}

// Database operations
export const donationService = {
  async create(donation: Omit<Donation, 'id' | 'created_at' | 'updated_at' | 'status'>) {
    const { data, error } = await supabase
      .from('donations')
      .insert([donation])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async getAll() {
    const { data, error } = await supabase
      .from('donations')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data;
  },

  async updateStatus(id: string, status: 'available' | 'matched') {
    const { data, error } = await supabase
      .from('donations')
      .update({ status })
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }
};

export const requestService = {
  async create(request: Omit<Request, 'id' | 'created_at' | 'updated_at' | 'status'>) {
    const { data, error } = await supabase
      .from('requests')
      .insert([request])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async getAll() {
    const { data, error } = await supabase
      .from('requests')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data;
  },

  async updateStatus(id: string, status: 'pending' | 'matched') {
    const { data, error } = await supabase
      .from('requests')
      .update({ status })
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }
};

// Matching logic
export const matchingService = {
  async findMatches(medicineName: string) {
    const { data, error } = await supabase
      .from('donations')
      .select('*')
      .eq('medicine_name', medicineName)
      .eq('status', 'available');
    
    if (error) throw error;
    return data;
  },

  async processMatch(donationId: string, requestId: string) {
    // Update both donation and request status to matched
    const [donationResult, requestResult] = await Promise.all([
      donationService.updateStatus(donationId, 'matched'),
      requestService.updateStatus(requestId, 'matched')
    ]);

    return { donation: donationResult, request: requestResult };
  }
};