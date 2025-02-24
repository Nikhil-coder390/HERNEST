/*
  # Initial Schema Setup for HerNest

  1. New Tables
    - `profiles`
      - Basic user information and preferences
      - Linked to auth.users
      - Includes doctor-specific fields when applicable
    
    - `period_logs`
      - Track menstrual cycle data
      - Start date, end date, symptoms
      - Links to user profiles
    
    - `appointments`
      - Doctor consultation bookings
      - Status tracking and payment info
      - Links patients with doctors
    
    - `prescriptions`
      - Medical prescriptions from consultations
      - Medication details and instructions
      - Links to appointments

  2. Security
    - RLS policies for each table
    - Separate policies for doctors and patients
    - Ensure data privacy and access control
*/

-- Profiles table for both patients and doctors
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  full_name text,
  date_of_birth date,
  phone_number text,
  is_doctor boolean DEFAULT false,
  -- Doctor-specific fields
  specialization text,
  license_number text,
  consultation_fee integer,
  years_of_experience integer,
  available_time_slots jsonb,
  -- Patient-specific fields
  cycle_length integer,
  last_period_date date,
  health_conditions text[]
);

-- Period tracking logs
CREATE TABLE IF NOT EXISTS period_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz DEFAULT now(),
  user_id uuid REFERENCES profiles(id) NOT NULL,
  start_date date NOT NULL,
  end_date date,
  flow_intensity text,
  symptoms text[],
  notes text
);

-- Appointments for doctor consultations
CREATE TABLE IF NOT EXISTS appointments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz DEFAULT now(),
  patient_id uuid REFERENCES profiles(id) NOT NULL,
  doctor_id uuid REFERENCES profiles(id) NOT NULL,
  scheduled_for timestamptz NOT NULL,
  status text DEFAULT 'pending',
  payment_status text DEFAULT 'pending',
  payment_amount integer NOT NULL,
  meeting_link text,
  notes text
);

-- Prescriptions linked to appointments
CREATE TABLE IF NOT EXISTS prescriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz DEFAULT now(),
  appointment_id uuid REFERENCES appointments(id) NOT NULL,
  doctor_id uuid REFERENCES profiles(id) NOT NULL,
  patient_id uuid REFERENCES profiles(id) NOT NULL,
  medications jsonb NOT NULL,
  instructions text,
  valid_until date
);

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE period_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE prescriptions ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view their own profile"
  ON profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Doctors are visible to all authenticated users"
  ON profiles
  FOR SELECT
  TO authenticated
  USING (is_doctor = true);

-- Period logs policies
CREATE POLICY "Users can manage their own period logs"
  ON period_logs
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id);

-- Appointments policies
CREATE POLICY "Patients can view their appointments"
  ON appointments
  FOR SELECT
  TO authenticated
  USING (auth.uid() = patient_id);

CREATE POLICY "Doctors can view their appointments"
  ON appointments
  FOR SELECT
  TO authenticated
  USING (auth.uid() = doctor_id);

CREATE POLICY "Patients can create appointments"
  ON appointments
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = patient_id);

CREATE POLICY "Doctors can update their appointments"
  ON appointments
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = doctor_id);

-- Prescriptions policies
CREATE POLICY "Patients can view their prescriptions"
  ON prescriptions
  FOR SELECT
  TO authenticated
  USING (auth.uid() = patient_id);

CREATE POLICY "Doctors can manage prescriptions"
  ON prescriptions
  FOR ALL
  TO authenticated
  USING (auth.uid() = doctor_id);

-- Functions
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, is_doctor)
  VALUES (new.id, new.raw_user_meta_data->>'full_name', 
         (new.raw_user_meta_data->>'is_doctor')::boolean);
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for new user creation
CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();