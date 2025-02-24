import React, { useEffect, useState } from 'react';
import Calendar from 'react-calendar';
import { format } from 'date-fns';
import { Calendar as CalendarIcon, Clock, User, Activity } from 'lucide-react';
import { supabase } from '../lib/supabase';
import type { PeriodLog, Appointment } from '../types/database';
import { useAuthStore } from '../lib/store';

export default function PatientDashboard() {
  const { profile } = useAuthStore();
  const [periodLogs, setPeriodLogs] = useState<PeriodLog[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [selectedDate, setSelectedDate] = useState(new Date());

  useEffect(() => {
    if (profile) {
      loadPeriodLogs();
      loadAppointments();
    }
  }, [profile]);

  const loadPeriodLogs = async () => {
    const { data } = await supabase
      .from('period_logs')
      .select('*')
      .eq('user_id', profile?.id)
      .order('start_date', { ascending: false });
    
    if (data) setPeriodLogs(data);
  };

  const loadAppointments = async () => {
    const { data } = await supabase
      .from('appointments')
      .select('*, doctor:profiles!doctor_id(full_name)')
      .eq('patient_id', profile?.id)
      .order('scheduled_for', { ascending: true });
    
    if (data) setAppointments(data);
  };

  const handleAddPeriodLog = async () => {
    const { error } = await supabase
      .from('period_logs')
      .insert({
        user_id: profile?.id,
        start_date: format(selectedDate, 'yyyy-MM-dd'),
      });

    if (!error) {
      loadPeriodLogs();
    }
  };

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Period Tracking */}
        <div className="md:col-span-2 bg-white p-6 rounded-xl shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-semibold text-gray-800">Period Tracker</h2>
            <button
              onClick={handleAddPeriodLog}
              className="px-4 py-2 bg-rose-500 text-white rounded-md hover:bg-rose-600 transition"
            >
              Log Period
            </button>
          </div>
          
          <Calendar
            onChange={setSelectedDate}
            value={selectedDate}
            tileClassName={({ date }) => {
              const hasLog = periodLogs.some(log => 
                format(new Date(log.start_date), 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd')
              );
              return hasLog ? 'bg-rose-100 text-rose-800' : '';
            }}
            className="w-full rounded-lg border-0 shadow-sm"
          />
        </div>

        {/* Quick Stats */}
        <div className="space-y-4">
          <div className="bg-white p-6 rounded-xl shadow-sm">
            <div className="flex items-center space-x-3 mb-2">
              <CalendarIcon className="h-5 w-5 text-rose-500" />
              <h3 className="text-lg font-medium text-gray-800">Next Period</h3>
            </div>
            <p className="text-2xl font-semibold text-rose-600">
              {profile?.last_period_date ? 
                format(new Date(profile.last_period_date), 'MMM dd, yyyy') :
                'Not set'
              }
            </p>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm">
            <div className="flex items-center space-x-3 mb-2">
              <Clock className="h-5 w-5 text-rose-500" />
              <h3 className="text-lg font-medium text-gray-800">Cycle Length</h3>
            </div>
            <p className="text-2xl font-semibold text-rose-600">
              {profile?.cycle_length || 'Not set'} days
            </p>
          </div>
        </div>
      </div>

      {/* Upcoming Appointments */}
      <div className="bg-white p-6 rounded-xl shadow-sm">
        <h2 className="text-2xl font-semibold text-gray-800 mb-6">Upcoming Appointments</h2>
        
        <div className="space-y-4">
          {appointments.length === 0 ? (
            <p className="text-gray-500">No upcoming appointments</p>
          ) : (
            appointments.map((appointment) => (
              <div
                key={appointment.id}
                className="flex items-center justify-between p-4 border rounded-lg hover:bg-rose-50 transition"
              >
                <div className="flex items-center space-x-4">
                  <User className="h-10 w-10 text-rose-500" />
                  <div>
                    <p className="font-medium text-gray-800">
                      Dr. {(appointment as any).doctor.full_name}
                    </p>
                    <p className="text-sm text-gray-500">
                      {format(new Date(appointment.scheduled_for), 'MMM dd, yyyy - h:mm a')}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <span className={`px-3 py-1 rounded-full text-sm ${
                    appointment.status === 'confirmed' 
                      ? 'bg-green-100 text-green-800'
                      : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {appointment.status}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}