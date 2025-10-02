'use client';

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Search, MapPin, Clock, CheckCircle, Star, Calendar, Users, Shield } from "lucide-react";
import { getClinics, getPractitioners } from "@/lib/api";
import Link from "next/link";

const Index = () => {
  const [specialty, setSpecialty] = useState("");
  const [location, setLocation] = useState("");
  const [date, setDate] = useState("");
  
  const { data: practitioners = [] } = useQuery({
    queryKey: ['practitioners'],
    queryFn: () => getPractitioners(),
  });

  const featuredPractitioners = (practitioners as any[]).slice(0, 4);
  
  return (
    <div className="min-h-screen bg-white">
      <Header />
      
      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-blue-50 to-indigo-100 overflow-hidden">
        <div className="container mx-auto px-4 py-16">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <div className="space-y-6">
              <h1 className="text-5xl lg:text-6xl font-bold leading-tight">
                Book Your Doctor's
                <br />
                <span className="text-blue-600">Appointment Online</span>
                <br />
                <span className="text-gray-700">in Minutes</span>
              </h1>
              
              <p className="text-lg text-gray-600 max-w-lg">
                Find Trusted Care, See Real-Time Availability,
                and Get Peace of Mind Today
              </p>
              
              <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 text-lg">
                Find a Doctor Now
              </Button>
            </div>
            
            {/* Right Content - Doctor Image */}
            <div className="relative">
              <div className="bg-white rounded-2xl shadow-xl p-8 relative">
                <div className="grid grid-cols-5 gap-4 items-end justify-center min-h-[300px]">
                  {/* Simulated doctor avatars */}
                  <div className="w-16 h-16 bg-blue-200 rounded-full flex items-center justify-center">
                    <Users className="w-8 h-8 text-blue-600" />
                  </div>
                  <div className="w-20 h-20 bg-green-200 rounded-full flex items-center justify-center">
                    <Users className="w-10 h-10 text-green-600" />
                  </div>
                  <div className="w-24 h-24 bg-purple-200 rounded-full flex items-center justify-center">
                    <Users className="w-12 h-12 text-purple-600" />
                  </div>
                  <div className="w-20 h-20 bg-orange-200 rounded-full flex items-center justify-center">
                    <Users className="w-10 h-10 text-orange-600" />
                  </div>
                  <div className="w-16 h-16 bg-pink-200 rounded-full flex items-center justify-center">
                    <Users className="w-8 h-8 text-pink-600" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Search Section */}
      <section className="py-12 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl font-bold text-center mb-8">Search for Doctors</h2>
            
            <Card className="p-6 shadow-lg">
              <div className="grid md:grid-cols-1 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">
                    What condition or specialty are you looking for?
                  </label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input 
                      placeholder="e.g. diabetes care, women's health, children's doctor, mental health"
                      className="pl-10 pr-4 py-3 text-lg"
                      value={specialty}
                      onChange={(e) => setSpecialty(e.target.value)}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          window.location.href = `/search?query=${encodeURIComponent(specialty)}`;
                        }
                      }}
                    />
                  </div>
                </div>
              </div>
              
              {/* Popular Conditions */}
              <div className="mt-6">
                <p className="text-sm font-medium text-gray-700 mb-3">Popular conditions:</p>
                <div className="flex flex-wrap gap-2">
                  {[
                    'Diabetes Care',
                    'Women\'s Health', 
                    'Children\'s Health',
                    'Mental Health',
                    'Skin Checks',
                    'Travel Medicine',
                    'General Checkup',
                    'Chronic Disease'
                  ].map((condition) => (
                    <button
                      key={condition}
                      onClick={() => window.location.href = `/search?query=${encodeURIComponent(condition)}`}
                      className="px-3 py-1 text-sm bg-blue-50 text-blue-700 rounded-full hover:bg-blue-100 transition-colors"
                    >
                      {condition}
                    </button>
                  ))}
                </div>
              </div>
              
              <div className="mt-6 text-center">
                <Button 
                  className="bg-blue-600 hover:bg-blue-700 px-12 py-3"
                  onClick={() => window.location.href = `/search?query=${encodeURIComponent(specialty)}`}
                >
                  <Search className="w-4 h-4 mr-2" />
                  Find Your Doctor
                </Button>
              </div>
            </Card>
          </div>
        </div>
      </section>
      
      {/* Features Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Clock className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">24/7 Booking Access</h3>
              <p className="text-gray-600">Book appointments anytime, anywhere with real-time availability</p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Verified Patient Reviews</h3>
              <p className="text-gray-600">Read authentic reviews from real patients to make informed decisions</p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="w-8 h-8 text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Easy Insurance Verification</h3>
              <p className="text-gray-600">Verify your insurance coverage instantly before booking</p>
            </div>
          </div>
        </div>
      </section>

      {/* Patient Testimonials */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Patient Testimonials</h2>
          
          <div className="max-w-4xl mx-auto">
            <Card className="p-8 bg-blue-50 border-blue-200">
              <div className="flex items-start gap-4">
                <div className="w-16 h-16 bg-blue-200 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-xl font-bold text-blue-600">MP</span>
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-3">
                    <h4 className="font-semibold text-lg">Maria P.</h4>
                    <div className="flex gap-1">
                      {[1,2,3,4,5].map((star) => (
                        <Star key={star} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                      ))}
                    </div>
                  </div>
                  <p className="text-gray-700 italic text-lg mb-4">
                    "So easy to use, found such a great doctor!"
                  </p>
                  <p className="text-gray-600">
                    The platform made it incredibly simple to find and book an appointment with a specialist. 
                    The doctor was excellent and the whole experience was seamless.
                  </p>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* Featured Doctors */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Our Expert Practitioners</h2>
          
          <div className="grid md:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {featuredPractitioners.map((doctor: any) => (
              <Card key={doctor.id} className="p-6 text-center hover:shadow-lg transition-shadow">
                <CardContent className="p-0">
                  <div className="w-20 h-20 bg-gradient-to-br from-blue-100 to-blue-200 rounded-full mx-auto mb-4 flex items-center justify-center">
                    <Users className="w-10 h-10 text-blue-600" />
                  </div>
                  <h3 className="font-semibold text-lg mb-1">{doctor.name}</h3>
                  <p className="text-blue-600 text-sm mb-2">{doctor.title}</p>
                  
                  {/* Specialties */}
                  <div className="flex flex-wrap justify-center gap-1 mb-3">
                    {doctor.specialties?.slice(0, 2).map((specialty: string, idx: number) => (
                      <Badge key={idx} variant="secondary" className="text-xs">
                        {specialty}
                      </Badge>
                    ))}
                  </div>
                  
                  <div className="flex items-center justify-center gap-1 mb-3">
                    <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    <span className="text-sm text-gray-600">{doctor.rating}</span>
                  </div>
                  
                  {/* Consultation Types */}
                  <div className="flex justify-center gap-2 mb-4">
                    {doctor.consultationTypes?.includes('in-person') && (
                      <Badge variant="outline" className="text-xs">In-person</Badge>
                    )}
                    {doctor.consultationTypes?.includes('telehealth') && (
                      <Badge variant="outline" className="text-xs">Telehealth</Badge>
                    )}
                  </div>
                  
                  <Button 
                    size="sm" 
                    className="w-full"
                    onClick={() => window.location.href = `/booking?practitioner=${doctor.id}`}
                  >
                    Book Appointment
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
          
          <div className="text-center mt-8">
            <Button variant="outline" onClick={() => window.location.href = '/search'}>
              View All Practitioners
            </Button>
          </div>
        </div>
      </section>
      
    
      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <h3 className="font-semibold text-lg mb-4">MedBooking</h3>
              <p className="text-gray-400 text-sm">
                Your trusted platform for booking medical appointments with verified healthcare providers.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Quick Links</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Find Doctors</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Book Appointment</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Health Records</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Insurance</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Help Center</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Contact Us</a></li>
                <li><a href="#" className="hover:text-white transition-colors">FAQs</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Privacy Policy</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Contact</h4>
              <div className="space-y-2 text-sm text-gray-400">
                <p>📞 1800-MEDBOOK</p>
                <p>✉️ help@medbook.com.au</p>
                <p>📍 Sydney, Australia</p>
              </div>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-sm text-gray-400">
            <p>&copy; 2025 MedBooking Australia. All rights reserved. | Privacy compliant with Australian Privacy Act</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
