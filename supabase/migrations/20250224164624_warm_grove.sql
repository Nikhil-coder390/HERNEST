/*
  # Fix Period Logs RLS and Add Triggers

  1. Changes
    - Update period logs RLS policies
    - Add notification trigger for period logs
    - Fix profile queries

  2. Security
    - Ensure proper access control for period logs
    - Add notification system integration
*/

-- Drop existing period logs policy
DROP POLICY IF EXISTS "Users can manage their own period logs" ON period_logs;

-- Create more specific period logs policies
CREATE POLICY "Users can view their own period logs"
  ON period_logs
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own period logs"
  ON period_logs
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own period logs"
  ON period_logs
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own period logs"
  ON period_logs
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Function to notify about new period logs
CREATE OR REPLACE FUNCTION notify_period_log_created()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Create notification for new period log
  PERFORM create_notification(
    NEW.user_id,
    'period',
    'Period Log Added',
    'A new period log has been added for ' || to_char(NEW.start_date::date, 'Mon DD, YYYY'),
    '/dashboard',
    jsonb_build_object('period_log_id', NEW.id)
  );
  
  RETURN NEW;
END;
$$;

-- Create trigger for period log notifications
DROP TRIGGER IF EXISTS on_period_log_created ON period_logs;
CREATE TRIGGER on_period_log_created
  AFTER INSERT ON period_logs
  FOR EACH ROW
  EXECUTE FUNCTION notify_period_log_created();