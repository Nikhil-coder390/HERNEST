export interface Profile {
  id: string;
  created_at: string;
  updated_at: string;
  full_name: string | null;
  date_of_birth: string | null;
  phone_number: string | null;
  is_doctor: boolean;
  specialization: string | null;
  license_number: string | null;
  consultation_fee: number | null;
  years_of_experience: number | null;
  available_time_slots: any | null;
  cycle_length: number | null;
  last_period_date: string | null;
  health_conditions: string[] | null;
}

export interface PeriodLog {
  id: string;
  created_at: string;
  user_id: string;
  start_date: string;
  end_date: string | null;
  flow_intensity: string | null;
  symptoms: string[] | null;
  notes: string | null;
}

export interface Appointment {
  id: string;
  created_at: string;
  patient_id: string;
  doctor_id: string;
  scheduled_for: string;
  status: string;
  payment_status: string;
  payment_amount: number;
  meeting_link: string | null;
  notes: string | null;
}

export interface Prescription {
  id: string;
  created_at: string;
  appointment_id: string;
  doctor_id: string;
  patient_id: string;
  medications: {
    name: string;
    dosage: string;
    frequency: string;
    duration: string;
  }[];
  instructions: string | null;
  valid_until: string | null;
}

export interface HealthRecord {
  id: string;
  created_at: string;
  user_id: string;
  record_date: string;
  record_type: 'general' | 'menstrual' | 'medication' | 'symptom' | 'test';
  title: string;
  description: string;
  attachments?: string[];
  metadata: Record<string, any>;
}

export interface Notification {
  id: string;
  created_at: string;
  user_id: string;
  type: 'appointment' | 'prescription' | 'period' | 'system';
  title: string;
  message: string;
  read: boolean;
  action_url?: string;
  metadata: Record<string, any>;
}