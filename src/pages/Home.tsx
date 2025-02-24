import React from 'react';
import { Link } from 'react-router-dom';
import { Calendar, MessageCircle, Stethoscope, MapPin } from 'lucide-react';

export default function Home() {
  return (
    <div className="max-w-6xl mx-auto">
      <section className="text-center py-16">
        <h1 className="text-5xl font-bold text-gray-900 mb-6">
          Your Personal Space for
          <span className="text-rose-500"> Menstrual Wellness</span>
        </h1>
        <p className="text-xl text-gray-600 mb-8">
          Track your cycle, connect with doctors, and get AI-powered health guidance
          all in one place.
        </p>
        <Link
          to="/auth"
          className="inline-block px-8 py-4 bg-rose-500 text-white rounded-full text-lg font-semibold hover:bg-rose-600 transition"
        >
          Get Started
        </Link>
      </section>

      <section className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 py-16">
        <div className="bg-white p-8 rounded-xl shadow-sm">
          <Calendar className="h-12 w-12 text-rose-500 mb-4" />
          <h3 className="text-xl font-semibold mb-2">Period Tracking</h3>
          <p className="text-gray-600">
            Keep track of your menstrual cycle with our intuitive calendar and get
            personalized predictions.
          </p>
        </div>

        <div className="bg-white p-8 rounded-xl shadow-sm">
          <MessageCircle className="h-12 w-12 text-rose-500 mb-4" />
          <h3 className="text-xl font-semibold mb-2">AI Health Assistant</h3>
          <p className="text-gray-600">
            Get instant answers to your health queries from our AI-powered chatbot.
          </p>
        </div>

        <div className="bg-white p-8 rounded-xl shadow-sm">
          <Stethoscope className="h-12 w-12 text-rose-500 mb-4" />
          <h3 className="text-xl font-semibold mb-2">Doctor Consultations</h3>
          <p className="text-gray-600">
            Book virtual consultations with experienced healthcare professionals.
          </p>
        </div>

        <div className="bg-white p-8 rounded-xl shadow-sm">
          <MapPin className="h-12 w-12 text-rose-500 mb-4" />
          <h3 className="text-xl font-semibold mb-2">Pharmacy Locator</h3>
          <p className="text-gray-600">
            Find nearby pharmacies to get recommended medicines quickly and easily.
          </p>
        </div>
      </section>

      <section className="py-16">
        <div className="bg-rose-100 rounded-2xl p-8 md:p-12">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl font-bold mb-6">For Healthcare Providers</h2>
            <p className="text-lg text-gray-700 mb-8">
              Join our network of healthcare professionals and connect with patients
              who need your expertise.
            </p>
            <Link
              to="/auth?type=doctor"
              className="inline-block px-8 py-4 bg-rose-500 text-white rounded-full text-lg font-semibold hover:bg-rose-600 transition"
            >
              Join as a Doctor
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
