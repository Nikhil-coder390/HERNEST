import React, { useState, useEffect } from 'react';
import { format, addDays, isAfter, isBefore, startOfDay } from 'date-fns';
import { Calendar, Clock, DollarSign } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../lib/store';
import type { Profile } from '../types/database';

const TIME_SLOTS = [
  '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
  '14:00', '14:30', '15:00', '15:30', '16:00', '16:30'
];

export default function BookAppointment() {
  const { profile: currentProfile } = useAuthStore();
  const [doctors, setDoctors] = useState<Profile[]>([]);
  const [selectedDoctor, setSelectedDoctor] = useState<Profile | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date>(addDays(new Date(), 1));
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    loadDoctors();
  }, []);

  const loadDoctors = async () => {
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('is_doctor', true);
    
    if (data) setDoctors(data);
  };

  const handleBooking = async () => {
    if (!selectedDoctor || !selectedDate || !selectedTime || !currentProfile) {
      toast.error('Please select all required fields');
      return;
    }

    setIsLoading(true);

    try {
      const appointmentDateTime = new Date(`${format(selectedDate, 'yyyy-MM-dd')}T${selectedTime}`);

      const { error } = await supabase
        .from('appointments')
        .insert({
          patient_id: currentProfile.id,
          doctor_id: selectedDoctor.id,
          scheduled_for: appointmentDateTime.toISOString(),
          payment_amount: selectedDoctor.consultation_fee || 0,
          status: 'pending',
          payment_status: 'pending'
        });

      if (error) throw error;

      toast.success('Appointment booked successfully!');
      setSelectedDoctor(null);
      setSelectedDate(addDays(new Date(), 1));
      setSelectedTime('');
    } catch (error) {
      console.error('Booking error:', error);
      toast.error('Failed to book appointment. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const isDateDisabled = (date: Date) => {
    return isBefore(startOfDay(date), startOfDay(new Date())) || 
           isAfter(date, addDays(new Date(), 30));
  };

  return (
    <div className="max-w-2xl mx-auto bg-white rounded-xl shadow-sm p-8">
      <h1 className="text-2xl font-bold text-gray-800 mb-8">Book an Appointment</h1>

      <div className="space-y-6">
        {/* Doctor Selection */}
        <div className="space-y-4">
          <div className="flex items-center space-x-4 p-4 bg-rose-50 rounded-lg">
            <Calendar className="h-6 w-6 text-rose-500" />
            <h2 className="text-lg font-medium text-gray-800">Select a Doctor</h2>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {doctors.map((doctor) => (
              <button
                key={doctor.id}
                onClick={() => setSelectedDoctor(doctor)}
                className={`flex items-center justify-between p-4 rounded-lg border transition ${
                  selectedDoctor?.id === doctor.id
                    ? 'border-rose-500 bg-rose-50'
                    : 'border-gray-200 hover:border-rose-500'
                }`}
              >
                <div className="flex items-center space-x-4">
                  <div>
                    <p className="font-medium text-gray-800">Dr. {doctor.full_name}</p>
                    <p className="text-sm text-gray-500">{doctor.specialization}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <DollarSign className="h-4 w-4 text-gray-500" />
                  <span className="text-gray-700">${doctor.consultation_fee}</span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Date Selection */}
        {selectedDoctor && (
          <div className="space-y-4">
            <div className="flex items-center space-x-4 p-4 bg-rose-50 rounded-lg">
              <Calendar className="h-6 w-6 text-rose-500" />
              <h2 className="text-lg font-medium text-gray-800">Select a Date</h2>
            </div>

            <div className="grid grid-cols-4 gap-2">
              {[...Array(7)].map((_, i) => {
                const date = addDays(new Date(), i + 1);
                const isDisabled = isDateDisabled(date);
                return (
                  <button
                    key={i}
                    onClick={() => !isDisabled && setSelectedDate(date)}
                    disabled={isDisabled}
                    className={`p-4 rounded-lg border text-center transition ${
                      format(selectedDate, 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd')
                        ? 'border-rose-500 bg-rose-50'
                        : isDisabled
                        ? 'border-gray-200 bg-gray-50 cursor-not-allowed'
                        : 'border-gray-200 hover:border-rose-500'
                    }`}
                  >
                    <p className="text-sm text-gray-600">{format(date, 'EEE')}</p>
                    <p className="text-lg font-medium text-gray-800">{format(date, 'd')}</p>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Time Selection */}
        {selectedDoctor && selectedDate && (
          <div className="space-y-4">
            <div className="flex items-center space-x-4 p-4 bg-rose-50 rounded-lg">
              <Clock className="h-6 w-6 text-rose-500" />
              <h2 className="text-lg font-medium text-gray-800">Select a Time</h2>
            </div>

            <div className="grid grid-cols-4 gap-2">
              {TIME_SLOTS.map((time) => (
                <button
                  key={time}
                  onClick={() => setSelectedTime(time)}
                  className={`p-4 rounded-lg border text-center transition ${
                    selectedTime === time
                      ? 'border-rose-500 bg-rose-50'
                      : 'border-gray-200 hover:border-rose-500'
                  }`}
                >
                  {time}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Booking Button */}
        {selectedDoctor && selectedDate && selectedTime && (
          <div className="pt-6">
            <button
              onClick={handleBooking}
              disabled={isLoading}
              className="w-full px-4 py-2 bg-rose-500 text-white rounded-md hover:bg-rose-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-rose-500 disabled:opacity-50"
            >
              {isLoading ? 'Booking...' : 'Book Appointment'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}