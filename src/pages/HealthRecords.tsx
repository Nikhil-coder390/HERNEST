import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { FileText, Plus, X, Upload } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../lib/store';
import type { HealthRecord } from '../types/database';

const RECORD_TYPES = [
  { value: 'general', label: 'General Health' },
  { value: 'menstrual', label: 'Menstrual Health' },
  { value: 'medication', label: 'Medication' },
  { value: 'symptom', label: 'Symptom' },
  { value: 'test', label: 'Test Results' },
];

export default function HealthRecords() {
  const { profile } = useAuthStore();
  const [records, setRecords] = useState<HealthRecord[]>([]);
  const [isCreating, setIsCreating] = useState(false);
  const [newRecord, setNewRecord] = useState({
    record_type: 'general',
    title: '',
    description: '',
    metadata: {},
  });

  useEffect(() => {
    if (profile) {
      loadHealthRecords();
    }
  }, [profile]);

  const loadHealthRecords = async () => {
    const { data, error } = await supabase
      .from('health_records')
      .select('*')
      .eq('user_id', profile?.id)
      .order('record_date', { ascending: false });

    if (error) {
      toast.error('Failed to load health records');
    } else if (data) {
      setRecords(data);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;

    try {
      const { error } = await supabase.from('health_records').insert({
        user_id: profile.id,
        record_date: new Date().toISOString(),
        ...newRecord,
      });

      if (error) throw error;

      toast.success('Health record added successfully');
      setIsCreating(false);
      loadHealthRecords();
    } catch (error) {
      toast.error('Failed to add health record');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">Health Records</h1>
        <button
          onClick={() => setIsCreating(true)}
          className="px-4 py-2 bg-rose-500 text-white rounded-md hover:bg-rose-600"
        >
          <Plus className="h-5 w-5" />
        </button>
      </div>

      {isCreating && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold">Add Health Record</h2>
              <button onClick={() => setIsCreating(false)}>
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Record Type
                </label>
                <select
                  value={newRecord.record_type}
                  onChange={(e) =>
                    setNewRecord({ ...newRecord, record_type: e.target.value as any })
                  }
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-rose-500 focus:ring-rose-500"
                >
                  {RECORD_TYPES.map((type) => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Title
                </label>
                <input
                  type="text"
                  value={newRecord.title}
                  onChange={(e) =>
                    setNewRecord({ ...newRecord, title: e.target.value })
                  }
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-rose-500 focus:ring-rose-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Description
                </label>
                <textarea
                  value={newRecord.description}
                  onChange={(e) =>
                    setNewRecord({ ...newRecord, description: e.target.value })
                  }
                  rows={4}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-rose-500 focus:ring-rose-500"
                  required
                />
              </div>

              <div className="flex justify-end">
                <button
                  type="submit"
                  className="px-4 py-2 bg-rose-500 text-white rounded-md hover:bg-rose-600"
                >
                  Add Record
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {records.length === 0 ? (
          <p className="text-gray-500 col-span-2">No health records found</p>
        ) : (
          records.map((record) => (
            <div
              key={record.id}
              className="bg-white p-6 rounded-xl shadow-sm space-y-4"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <FileText className="h-8 w-8 text-rose-500" />
                  <div>
                    <p className="font-medium text-gray-800">{record.title}</p>
                    <p className="text-sm text-gray-500">
                      {format(new Date(record.record_date), 'MMM dd, yyyy')}
                    </p>
                  </div>
                </div>
                <span className="px-3 py-1 rounded-full text-sm bg-rose-100 text-rose-800">
                  {RECORD_TYPES.find((t) => t.value === record.record_type)?.label}
                </span>
              </div>

              <p className="text-gray-600">{record.description}</p>

              {record.attachments && record.attachments.length > 0 && (
                <div className="border-t pt-4">
                  <h3 className="font-medium text-gray-800 mb-2">Attachments</h3>
                  <div className="flex flex-wrap gap-2">
                    {record.attachments.map((attachment, index) => (
                      <a
                        key={index}
                        href={attachment}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center space-x-2 px-3 py-2 bg-gray-100 rounded-md hover:bg-gray-200"
                      >
                        <Upload className="h-4 w-4" />
                        <span className="text-sm">View Attachment</span>
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}