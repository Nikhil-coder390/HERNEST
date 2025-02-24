import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'sonner';
import { CreditCard, Calendar, User } from 'lucide-react';
import { supabase } from '../lib/supabase';
import type { Appointment } from '../types/database';

export default function Payment() {
  const navigate = useNavigate();
  const { appointmentId } = useParams();
  const [appointment, setAppointment] = useState<Appointment | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [cardDetails, setCardDetails] = useState({
    number: '',
    expiry: '',
    cvc: '',
    name: '',
  });

  useEffect(() => {
    if (appointmentId) {
      loadAppointment();
    }
  }, [appointmentId]);

  const loadAppointment = async () => {
    const { data } = await supabase
      .from('appointments')
      .select(`
        *,
        doctor:profiles!doctor_id(full_name, specialization),
        patient:profiles!patient_id(full_name)
      `)
      .eq('id', appointmentId)
      .single();

    if (data) setAppointment(data);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setCardDetails(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!appointment) return;

    setIsProcessing(true);

    try {
      // Simulate payment processing
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Update appointment payment status
      const { error } = await supabase
        .from('appointments')
        .update({
          payment_status: 'completed',
          status: 'confirmed',
        })
        .eq('id', appointment.id);

      if (error) throw error;

      toast.success('Payment processed successfully');
      navigate('/dashboard');
    } catch (error) {
      toast.error('Payment processing failed');
    } finally {
      setIsProcessing(false);
    }
  };

  if (!appointment) return null;

  return (
    <div className="max-w-2xl mx-auto bg-white rounded-xl shadow-sm p-8">
      <h1 className="text-2xl font-bold text-gray-800 mb-8">Payment Details</h1>

      <div className="space-y-6">
        {/* Appointment Summary */}
        <div className="bg-rose-50 p-6 rounded-lg space-y-4">
          <div className="flex items-center space-x-4">
            <User className="h-6 w-6 text-rose-500" />
            <div>
              <p className="text-sm text-gray-600">Doctor</p>
              <p className="font-medium text-gray-800">
                Dr. {(appointment as any).doctor.full_name}
              </p>
              <p className="text-sm text-gray-600">
                {(appointment as any).doctor.specialization}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <Calendar className="h-6 w-6 text-rose-500" />
            <div>
              <p className="text-sm text-gray-600">Appointment Date</p>
              <p className="font-medium text-gray-800">
                {new Date(appointment.scheduled_for).toLocaleDateString()}
              </p>
              <p className="text-sm text-gray-600">
                {new Date(appointment.scheduled_for).toLocaleTimeString()}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <CreditCard className="h-6 w-6 text-rose-500" />
            <div>
              <p className="text-sm text-gray-600">Amount</p>
              <p className="font-medium text-gray-800">
                ${appointment.payment_amount}
              </p>
            </div>
          </div>
        </div>

        {/* Payment Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Card Number
            </label>
            <input
              type="text"
              name="number"
              value={cardDetails.number}
              onChange={handleInputChange}
              placeholder="1234 5678 9012 3456"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-rose-500 focus:ring-rose-500"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Expiry Date
              </label>
              <input
                type="text"
                name="expiry"
                value={cardDetails.expiry}
                onChange={handleInputChange}
                placeholder="MM/YY"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-rose-500 focus:ring-rose-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                CVC
              </label>
              <input
                type="text"
                name="cvc"
                value={cardDetails.cvc}
                onChange={handleInputChange}
                placeholder="123"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-rose-500 focus:ring-rose-500"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Cardholder Name
            </label>
            <input
              type="text"
              name="name"
              value={cardDetails.name}
              onChange={handleInputChange}
              placeholder="John Doe"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-rose-500 focus:ring-rose-500"
              required
            />
          </div>

          <button
            type="submit"
            disabled={isProcessing}
            className="w-full px-4 py-2 bg-rose-500 text-white rounded-md hover:bg-rose-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-rose-500 disabled:opacity-50"
          >
            {isProcessing ? 'Processing...' : `Pay $${appointment.payment_amount}`}
          </button>
        </form>
      </div>
    </div>
  );
}