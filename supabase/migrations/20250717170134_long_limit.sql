/*
  # MediMatch Database Schema

  1. New Tables
    - `donations`
      - `id` (uuid, primary key)
      - `donor_name` (text)
      - `contact` (text)
      - `medicine_name` (text)
      - `quantity` (text)
      - `expiry_date` (date, nullable)
      - `description` (text, nullable)
      - `status` (text, default 'available')
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

    - `requests`
      - `id` (uuid, primary key)
      - `requester_name` (text)
      - `contact` (text)
      - `medicine_name` (text)
      - `urgency` (text)
      - `reason` (text, nullable)
      - `location` (text, nullable)
      - `status` (text, default 'pending')
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on both tables
    - Add policies for public read/write access (since this is a public donation platform)
*/

-- Create donations table
CREATE TABLE IF NOT EXISTS donations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  donor_name text NOT NULL,
  contact text NOT NULL,
  medicine_name text NOT NULL,
  quantity text NOT NULL,
  expiry_date date,
  description text,
  status text DEFAULT 'available' CHECK (status IN ('available', 'matched')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create requests table
CREATE TABLE IF NOT EXISTS requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  requester_name text NOT NULL,
  contact text NOT NULL,
  medicine_name text NOT NULL,
  urgency text NOT NULL CHECK (urgency IN ('low', 'medium', 'high', 'critical')),
  reason text,
  location text,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'matched')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE donations ENABLE ROW LEVEL SECURITY;
ALTER TABLE requests ENABLE ROW LEVEL SECURITY;

-- Create policies for public access (appropriate for a donation platform)
CREATE POLICY "Anyone can view donations"
  ON donations
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Anyone can create donations"
  ON donations
  FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Anyone can update donations"
  ON donations
  FOR UPDATE
  TO public
  USING (true);

CREATE POLICY "Anyone can view requests"
  ON requests
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Anyone can create requests"
  ON requests
  FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Anyone can update requests"
  ON requests
  FOR UPDATE
  TO public
  USING (true);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_donations_medicine_name ON donations(medicine_name);
CREATE INDEX IF NOT EXISTS idx_donations_status ON donations(status);
CREATE INDEX IF NOT EXISTS idx_donations_created_at ON donations(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_requests_medicine_name ON requests(medicine_name);
CREATE INDEX IF NOT EXISTS idx_requests_status ON requests(status);
CREATE INDEX IF NOT EXISTS idx_requests_urgency ON requests(urgency);
CREATE INDEX IF NOT EXISTS idx_requests_created_at ON requests(created_at DESC);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_donations_updated_at
  BEFORE UPDATE ON donations
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_requests_updated_at
  BEFORE UPDATE ON requests
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();