import React, { useEffect, useState } from 'react';
import { format } from 'date-fns';
import { Calendar, Users, DollarSign, Clock } from 'lucide-react';
import { supabase } from '../lib/supabase';
import type { Appointment } from '../types/database';
import { useAuthStore } from '../lib/store';

export default function DoctorDashboard() {
  const { profile } = useAuthStore();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [stats, setStats] = useState({
    totalPatients: 0,
    totalEarnings: 0,
    pendingAppointments: 0,
  });

  useEffect(() => {
    if (profile) {
      loadAppointments();
      loadStats();
    }
  }, [profile]);

  const loadAppointments = async () => {
    const { data } = await supabase
      .from('appointments')
      .select('*, patient:profiles!patient_id(full_name)')
      .eq('doctor_id', profile?.id)
      .order('scheduled_for', { ascending: true });
    
    if (data) setAppointments(data);
  };

  const loadStats = async () => {
    if (!profile?.id) return;

    // Get unique patients count
    const { count: patientsCount } = await supabase
      .from('appointments')
      .select('patient_id', { count: 'exact', head: true })
      .eq('doctor_id', profile.id)
      .not('status', 'eq', 'cancelled');

    // Get total earnings
    const { data: earnings } = await supabase
      .from('appointments')
      .select('payment_amount')
      .eq('doctor_id', profile.id)
      .eq('payment_status', 'completed');

    const totalEarnings = earnings?.reduce((sum, app) => sum + app.payment_amount, 0) || 0;

    // Get pending appointments count
    const { count: pendingCount } = await supabase
      .from('appointments')
      .select('id', { count: 'exact', head: true })
      .eq('doctor_id', profile.id)
      .eq('status', 'pending');

    setStats({
      totalPatients: patientsCount || 0,
      totalEarnings,
      pendingAppointments: pendingCount || 0,
    });
  };

  const handleAppointmentStatus = async (appointmentId: string, status: string) => {
    const { error } = await supabase
      .from('appointments')
      .update({ status })
      .eq('id', appointmentId);

    if (!error) {
      loadAppointments();
      loadStats();
    }
  };

  return (
    <div className="space-y-8">
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm">
          <div className="flex items-center space-x-3 mb-2">
            <Users className="h-6 w-6 text-rose-500" />
            <h3 className="text-lg font-medium text-gray-800">Total Patients</h3>
          </div>
          <p className="text-3xl font-bold text-gray-900">{stats.totalPatients}</p>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm">
          <div className="flex items-center space-x-3 mb-2">
            <DollarSign className="h-6 w-6 text-rose-500" />
            <h3 className="text-lg font-medium text-gray-800">Total Earnings</h3>
          </div>
          <p className="text-3xl font-bold text-gray-900">${stats.totalEarnings}</p>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm">
          <div className="flex items-center space-x-3 mb-2">
            <Clock className="h-6 w-6 text-rose-500" />
            <h3 className="text-lg font-medium text-gray-800">Pending Appointments</h3>
          </div>
          <p className="text-3xl font-bold text-gray-900">{stats.pendingAppointments}</p>
        </div>
      </div>

      {/* Today's Appointments */}
      <div className="bg-white p-6 rounded-xl shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-semibold text-gray-800">Today's Appointments</h2>
          <Calendar className="h-6 w-6 text-rose-500" />
        </div>

        <div className="space-y-4">
          {appointments.filter(app => 
            format(new Date(app.scheduled_for), 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd')
          ).length === 0 ? (
            <p className="text-gray-500">No appointments scheduled for today</p>
          ) : (
            appointments
              .filter(app => format(new Date(app.scheduled_for), 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd'))
              .map((appointment) => (
                <div
                  key={appointment.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-rose-50 transition"
                >
                  <div className="flex items-center space-x-4">
                    <Users className="h-10 w-10 text-rose-500" />
                    <div>
                      <p className="font-medium text-gray-800">
                        {(appointment as any).patient.full_name}
                      </p>
                      <p className="text-sm text-gray-500">
                        {format(new Date(appointment.scheduled_for), 'h:mm a')}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {appointment.status === 'pending' && (
                      <>
                        <button
                          onClick={() => handleAppointmentStatus(appointment.id, 'confirmed')}
                          className="px-3 py-1 bg-green-500 text-white rounded-md hover:bg-green-600"
                        >
                          Confirm
                        </button>
                        <button
                          onClick={() => handleAppointmentStatus(appointment.id, 'cancelled')}
                          className="px-3 py-1 bg-red-500 text-white rounded-md hover:bg-red-600"
                        >
                          Cancel
                        </button>
                      </>
                    )}
                    <span className={`px-3 py-1 rounded-full text-sm ${
                      appointment.status === 'confirmed' 
                        ? 'bg-green-100 text-green-800'
                        : appointment.status === 'cancelled'
                        ? 'bg-red-100 text-red-800'
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

      {/* Upcoming Appointments */}
      <div className="bg-white p-6 rounded-xl shadow-sm">
        <h2 className="text-2xl font-semibold text-gray-800 mb-6">Upcoming Appointments</h2>
        
        <div className="space-y-4">
          {appointments.filter(app => 
            new Date(app.scheduled_for) > new Date()
          ).length === 0 ? (
            <p className="text-gray-500">No upcoming appointments</p>
          ) : (
            appointments
              .filter(app => new Date(app.scheduled_for) > new Date())
              .map((appointment) => (
                <div
                  key={appointment.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-rose-50 transition"
                >
                  <div className="flex items-center space-x-4">
                    <Users className="h-10 w-10 text-rose-500" />
                    <div>
                      <p className="font-medium text-gray-800">
                        {(appointment as any).patient.full_name}
                      </p>
                      <p className="text-sm text-gray-500">
                        {format(new Date(appointment.scheduled_for), 'MMM dd, yyyy - h:mm a')}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {appointment.status === 'pending' && (
                      <>
                        <button
                          onClick={() => handleAppointmentStatus(appointment.id, 'confirmed')}
                          className="px-3 py-1 bg-green-500 text-white rounded-md hover:bg-green-600"
                        >
                          Confirm
                        </button>
                        <button
                          onClick={() => handleAppointmentStatus(appointment.id, 'cancelled')}
                          className="px-3 py-1 bg-red-500 text-white rounded-md hover:bg-red-600"
                        >
                          Cancel
                        </button>
                      </>
                    )}
                    <span className={`px-3 py-1 rounded-full text-sm ${
                      appointment.status === 'confirmed' 
                        ? 'bg-green-100 text-green-800'
                        : appointment.status === 'cancelled'
                        ? 'bg-red-100 text-red-800'
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