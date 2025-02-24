import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { FileText, Plus, X } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../lib/store';
import type { Prescription } from '../types/database';

export default function Prescriptions() {
  const { profile } = useAuthStore();
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [isCreating, setIsCreating] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState('');
  const [medications, setMedications] = useState([{ name: '', dosage: '', frequency: '', duration: '' }]);
  const [instructions, setInstructions] = useState('');

  useEffect(() => {
    loadPrescriptions();
  }, [profile]);

  const loadPrescriptions = async () => {
    const { data } = await supabase
      .from('prescriptions')
      .select(`
        *,
        doctor:profiles!doctor_id(full_name),
        patient:profiles!patient_id(full_name),
        appointment:appointments(scheduled_for)
      `)
      .order('created_at', { ascending: false });

    if (data) setPrescriptions(data);
  };

  const handleAddMedication = () => {
    setMedications([...medications, { name: '', dosage: '', frequency: '', duration: '' }]);
  };

  const handleRemoveMedication = (index: number) => {
    setMedications(medications.filter((_, i) => i !== index));
  };

  const handleMedicationChange = (index: number, field: string, value: string) => {
    const newMedications = [...medications];
    newMedications[index] = { ...newMedications[index], [field]: value };
    setMedications(newMedications);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAppointment || medications.some(m => !m.name || !m.dosage)) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      const { error } = await supabase
        .from('prescriptions')
        .insert({
          appointment_id: selectedAppointment,
          doctor_id: profile?.id,
          patient_id: profile?.id, // This should be the patient's ID from the appointment
          medications,
          instructions,
          valid_until: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days validity
        });

      if (error) throw error;

      toast.success('Prescription created successfully');
      setIsCreating(false);
      loadPrescriptions();
    } catch (error) {
      toast.error('Failed to create prescription');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">Prescriptions</h1>
        {profile?.is_doctor && (
          <button
            onClick={() => setIsCreating(true)}
            className="px-4 py-2 bg-rose-500 text-white rounded-md hover:bg-rose-600"
          >
            <Plus className="h-5 w-5" />
          </button>
        )}
      </div>

      {isCreating && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold">New Prescription</h2>
              <button onClick={() => setIsCreating(false)}>
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Appointment
                </label>
                <select
                  value={selectedAppointment}
                  onChange={(e) => setSelectedAppointment(e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-rose-500 focus:ring-rose-500"
                  required
                >
                  <option value="">Select an appointment</option>
                  {/* Add appointment options here */}
                </select>
              </div>

              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-medium">Medications</h3>
                  <button
                    type="button"
                    onClick={handleAddMedication}
                    className="text-rose-500 hover:text-rose-600"
                  >
                    Add Medication
                  </button>
                </div>

                {medications.map((medication, index) => (
                  <div key={index} className="p-4 border rounded-lg space-y-4">
                    <div className="flex justify-between">
                      <h4 className="font-medium">Medication {index + 1}</h4>
                      {index > 0 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveMedication(index)}
                          className="text-red-500 hover:text-red-600"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          Name
                        </label>
                        <input
                          type="text"
                          value={medication.name}
                          onChange={(e) => handleMedicationChange(index, 'name', e.target.value)}
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-rose-500 focus:ring-rose-500"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          Dosage
                        </label>
                        <input
                          type="text"
                          value={medication.dosage}
                          onChange={(e) => handleMedicationChange(index, 'dosage', e.target.value)}
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-rose-500 focus:ring-rose-500"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          Frequency
                        </label>
                        <input
                          type="text"
                          value={medication.frequency}
                          onChange={(e) => handleMedicationChange(index, 'frequency', e.target.value)}
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-rose-500 focus:ring-rose-500"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          Duration
                        </label>
                        <input
                          type="text"
                          value={medication.duration}
                          onChange={(e) => handleMedicationChange(index, 'duration', e.target.value)}
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-rose-500 focus:ring-rose-500"
                          required
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Instructions
                </label>
                <textarea
                  value={instructions}
                  onChange={(e) => setInstructions(e.target.value)}
                  rows={4}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-rose-500 focus:ring-rose-500"
                />
              </div>

              <div className="flex justify-end">
                <button
                  type="submit"
                  className="px-4 py-2 bg-rose-500 text-white rounded-md hover:bg-rose-600"
                >
                  Create Prescription
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="space-y-4">
        {prescriptions.length === 0 ? (
          <p className="text-gray-500">No prescriptions found</p>
        ) : (
          prescriptions.map((prescription) => (
            <div
              key={prescription.id}
              className="bg-white p-6 rounded-xl shadow-sm space-y-4"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <FileText className="h-8 w-8 text-rose-500" />
                  <div>
                    <p className="font-medium text-gray-800">
                      Dr. {(prescription as any).doctor.full_name}
                    </p>
                    <p className="text-sm text-gray-500">
                      {format(new Date(prescription.created_at), 'MMM dd, yyyy')}
                    </p>
                  </div>
                </div>
                <span className={`px-3 py-1 rounded-full text-sm ${
                  new Date(prescription.valid_until) > new Date()
                    ? 'bg-green-100 text-green-800'
                    : 'bg-red-100 text-red-800'
                }`}>
                  {new Date(prescription.valid_until) > new Date() ? 'Valid' : 'Expired'}
                </span>
              </div>

              <div className="border-t pt-4">
                <h3 className="font-medium text-gray-800 mb-2">Medications</h3>
                <div className="space-y-2">
                  {prescription.medications.map((medication, index) => (
                    <div key={index} className="p-3 bg-gray-50 rounded-lg">
                      <p className="font-medium">{medication.name}</p>
                      <p className="text-sm text-gray-600">
                        {medication.dosage} - {medication.frequency} for {medication.duration}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {prescription.instructions && (
                <div className="border-t pt-4">
                  <h3 className="font-medium text-gray-800 mb-2">Instructions</h3>
                  <p className="text-gray-600">{prescription.instructions}</p>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}