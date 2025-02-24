/*
  # Fix RLS Policies and Add Notification Triggers

  1. Changes
    - Fix appointments RLS policies
    - Add notification triggers for appointments and prescriptions
    - Add insert policy for notifications table

  2. Security
    - Update RLS policies to be more permissive for appointments
    - Allow system to create notifications
*/

-- Drop existing appointment policies
DROP POLICY IF EXISTS "Patients can create appointments" ON appointments;
DROP POLICY IF EXISTS "Patients can view their appointments" ON appointments;
DROP POLICY IF EXISTS "Doctors can view their appointments" ON appointments;
DROP POLICY IF EXISTS "Doctors can update their appointments" ON appointments;

-- Create more permissive appointment policies
CREATE POLICY "Users can view their appointments"
  ON appointments
  FOR SELECT
  TO authenticated
  USING (
    auth.uid() = patient_id OR 
    auth.uid() = doctor_id
  );

CREATE POLICY "Patients can create appointments"
  ON appointments
  FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = patient_id AND
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = doctor_id AND is_doctor = true
    )
  );

CREATE POLICY "Users can update their appointments"
  ON appointments
  FOR UPDATE
  TO authenticated
  USING (
    auth.uid() = patient_id OR 
    auth.uid() = doctor_id
  );

-- Add insert policy for notifications
CREATE POLICY "System can create notifications"
  ON notifications
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Function to create appointment notifications
CREATE OR REPLACE FUNCTION notify_appointment_changes()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    -- Notify doctor of new appointment
    PERFORM create_notification(
      NEW.doctor_id,
      'appointment',
      'New Appointment Request',
      'You have a new appointment request for ' || to_char(NEW.scheduled_for, 'Mon DD, YYYY HH:MI AM'),
      '/dashboard',
      jsonb_build_object('appointment_id', NEW.id)
    );
    
    -- Notify patient of appointment creation
    PERFORM create_notification(
      NEW.patient_id,
      'appointment',
      'Appointment Created',
      'Your appointment has been scheduled for ' || to_char(NEW.scheduled_for, 'Mon DD, YYYY HH:MI AM'),
      '/dashboard',
      jsonb_build_object('appointment_id', NEW.id)
    );
  ELSIF TG_OP = 'UPDATE' THEN
    IF NEW.status = 'confirmed' AND OLD.status = 'pending' THEN
      -- Notify patient of confirmation
      PERFORM create_notification(
        NEW.patient_id,
        'appointment',
        'Appointment Confirmed',
        'Your appointment for ' || to_char(NEW.scheduled_for, 'Mon DD, YYYY HH:MI AM') || ' has been confirmed',
        '/dashboard',
        jsonb_build_object('appointment_id', NEW.id)
      );
    ELSIF NEW.status = 'cancelled' AND OLD.status != 'cancelled' THEN
      -- Notify affected party of cancellation
      PERFORM create_notification(
        CASE 
          WHEN auth.uid() = NEW.doctor_id THEN NEW.patient_id
          ELSE NEW.doctor_id
        END,
        'appointment',
        'Appointment Cancelled',
        'The appointment for ' || to_char(NEW.scheduled_for, 'Mon DD, YYYY HH:MI AM') || ' has been cancelled',
        '/dashboard',
        jsonb_build_object('appointment_id', NEW.id)
      );
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Function to notify about new prescriptions
CREATE OR REPLACE FUNCTION notify_prescription_created()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Notify patient of new prescription
  PERFORM create_notification(
    NEW.patient_id,
    'prescription',
    'New Prescription',
    'A new prescription has been added to your records',
    '/prescriptions',
    jsonb_build_object('prescription_id', NEW.id)
  );
  
  RETURN NEW;
END;
$$;

-- Create triggers
DROP TRIGGER IF EXISTS on_appointment_changes ON appointments;
CREATE TRIGGER on_appointment_changes
  AFTER INSERT OR UPDATE ON appointments
  FOR EACH ROW
  EXECUTE FUNCTION notify_appointment_changes();

DROP TRIGGER IF EXISTS on_prescription_created ON prescriptions;
CREATE TRIGGER on_prescription_created
  AFTER INSERT ON prescriptions
  FOR EACH ROW
  EXECUTE FUNCTION notify_prescription_created();