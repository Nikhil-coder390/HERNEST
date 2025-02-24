import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { User, Calendar, Phone, Heart } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../lib/store';
import type { Profile } from '../types/database';

export default function ProfilePage() {
  const { profile: currentProfile, setProfile } = useAuthStore();
  const [isEditing, setIsEditing] = useState(false);
  const [profile, setLocalProfile] = useState<Partial<Profile>>({});
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (currentProfile) {
      setLocalProfile(currentProfile);
    }
  }, [currentProfile]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setLocalProfile(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: profile.full_name,
          phone_number: profile.phone_number,
          date_of_birth: profile.date_of_birth,
          cycle_length: profile.cycle_length,
          specialization: profile.specialization,
          license_number: profile.license_number,
          consultation_fee: profile.consultation_fee,
          years_of_experience: profile.years_of_experience,
        })
        .eq('id', currentProfile?.id);

      if (error) throw error;

      setProfile({ ...currentProfile, ...profile });
      setIsEditing(false);
      toast.success('Profile updated successfully!');
    } catch (error) {
      toast.error('Failed to update profile');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto bg-white rounded-xl shadow-sm p-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold text-gray-800">Profile Settings</h1>
        <button
          onClick={() => setIsEditing(!isEditing)}
          className="px-4 py-2 text-sm font-medium text-rose-600 hover:text-rose-700"
        >
          {isEditing ? 'Cancel' : 'Edit Profile'}
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-4">
          <div className="flex items-center space-x-4 p-4 bg-rose-50 rounded-lg">
            <User className="h-12 w-12 text-rose-500" />
            <div>
              <h2 className="text-lg font-medium text-gray-800">Personal Information</h2>
              <p className="text-sm text-gray-600">Update your personal details</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Full Name</label>
              <input
                type="text"
                name="full_name"
                value={profile.full_name || ''}
                onChange={handleInputChange}
                disabled={!isEditing}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-rose-500 focus:ring-rose-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Phone Number</label>
              <input
                type="tel"
                name="phone_number"
                value={profile.phone_number || ''}
                onChange={handleInputChange}
                disabled={!isEditing}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-rose-500 focus:ring-rose-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Date of Birth</label>
              <input
                type="date"
                name="date_of_birth"
                value={profile.date_of_birth || ''}
                onChange={handleInputChange}
                disabled={!isEditing}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-rose-500 focus:ring-rose-500"
              />
            </div>
          </div>
        </div>

        {currentProfile?.is_doctor ? (
          <div className="space-y-4">
            <div className="flex items-center space-x-4 p-4 bg-rose-50 rounded-lg">
              <Heart className="h-12 w-12 text-rose-500" />
              <div>
                <h2 className="text-lg font-medium text-gray-800">Professional Information</h2>
                <p className="text-sm text-gray-600">Your medical practice details</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Specialization</label>
                <input
                  type="text"
                  name="specialization"
                  value={profile.specialization || ''}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-rose-500 focus:ring-rose-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">License Number</label>
                <input
                  type="text"
                  name="license_number"
                  value={profile.license_number || ''}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-rose-500 focus:ring-rose-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Consultation Fee ($)</label>
                <input
                  type="number"
                  name="consultation_fee"
                  value={profile.consultation_fee || ''}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-rose-500 focus:ring-rose-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Years of Experience</label>
                <input
                  type="number"
                  name="years_of_experience"
                  value={profile.years_of_experience || ''}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-rose-500 focus:ring-rose-500"
                />
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center space-x-4 p-4 bg-rose-50 rounded-lg">
              <Calendar className="h-12 w-12 text-rose-500" />
              <div>
                <h2 className="text-lg font-medium text-gray-800">Cycle Information</h2>
                <p className="text-sm text-gray-600">Your menstrual cycle details</p>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Average Cycle Length (days)</label>
              <input
                type="number"
                name="cycle_length"
                value={profile.cycle_length || ''}
                onChange={handleInputChange}
                disabled={!isEditing}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-rose-500 focus:ring-rose-500"
              />
            </div>
          </div>
        )}

        {isEditing && (
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={isLoading}
              className="px-4 py-2 bg-rose-500 text-white rounded-md hover:bg-rose-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-rose-500"
            >
              {isLoading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        )}
      </form>
    </div>
  );
}