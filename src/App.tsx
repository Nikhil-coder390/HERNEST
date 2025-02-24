import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'sonner';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Auth from './pages/Auth';
import PatientDashboard from './pages/PatientDashboard';
import DoctorDashboard from './pages/DoctorDashboard';
import Profile from './pages/Profile';
import BookAppointment from './pages/BookAppointment';
import Chat from './pages/Chat';
import Prescriptions from './pages/Prescriptions';
import Payment from './pages/Payment';
import HealthRecords from './pages/HealthRecords';
import DashboardLayout from './components/DashboardLayout';
import { useAuthStore } from './lib/store';
import { supabase } from './lib/supabase';

function App() {
  const { user, setUser, setProfile, isDoctor } = useAuthStore();

  useEffect(() => {
    // Check active sessions and set the user
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        loadUserProfile(session.user.id);
      }
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        loadUserProfile(session.user.id);
      } else {
        setProfile(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const loadUserProfile = async (userId: string) => {
    try {
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('Error loading profile:', error);
        return;
      }

      if (profile) {
        setProfile(profile);
      }
    } catch (error) {
      console.error('Error loading profile:', error);
    }
  };

  return (
    <Router>
      {!user ? (
        <>
          <Navbar />
          <main className="container mx-auto px-4 py-8">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>
        </>
      ) : (
        <Routes>
          <Route
            path="/dashboard"
            element={
              <DashboardLayout>
                {isDoctor ? <DoctorDashboard /> : <PatientDashboard />}
              </DashboardLayout>
            }
          />
          <Route
            path="/profile"
            element={
              <DashboardLayout>
                <Profile />
              </DashboardLayout>
            }
          />
          <Route
            path="/health-records"
            element={
              <DashboardLayout>
                <HealthRecords />
              </DashboardLayout>
            }
          />
          <Route
            path="/book-appointment"
            element={
              <DashboardLayout>
                <BookAppointment />
              </DashboardLayout>
            }
          />
          <Route
            path="/chat"
            element={
              <DashboardLayout>
                <Chat />
              </DashboardLayout>
            }
          />
          <Route
            path="/prescriptions"
            element={
              <DashboardLayout>
                <Prescriptions />
              </DashboardLayout>
            }
          />
          <Route
            path="/payment/:appointmentId"
            element={
              <DashboardLayout>
                <Payment />
              </DashboardLayout>
            }
          />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      )}
      <Toaster position="top-right" />
    </Router>
  );
}

export default App;