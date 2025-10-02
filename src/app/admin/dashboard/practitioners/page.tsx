'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Sidebar } from '@/components/Sidebar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { 
  Users, 
  UserPlus, 
  Mail, 
  Phone, 
  Calendar,
  MapPin,
  Star,
  Activity,
  Clock
} from 'lucide-react';

interface Practitioner {
  id: string;
  name: string; // Full name like "Dr. Sarah Chen"
  firstName?: string; // Optional for backward compatibility
  lastName?: string; // Optional for backward compatibility
  email?: string;
  specialties: string[];
  rating: number;
  experience?: number;
  consultationTypes: string[];
  clinicId: string;
  phone?: string;
  bio?: string;
  title?: string;
  availability?: any;
}

export default function AdminPractitioners() {
  const { data: session, status } = useSession();
  const { user } = useAuth();
  const router = useRouter();
  const [practitioners, setPractitioners] = useState<Practitioner[]>([]);
  const [loading, setLoading] = useState(true);

  // Helper function to extract names from full name
  const extractNames = (fullName: string) => {
    if (!fullName) return { firstName: 'Unknown', lastName: 'Practitioner' };
    
    // Remove "Dr. " prefix if present
    const nameWithoutTitle = fullName.replace(/^Dr\.\s*/i, '');
    const nameParts = nameWithoutTitle.trim().split(' ');
    
    if (nameParts.length === 1) {
      return { firstName: nameParts[0], lastName: '' };
    } else if (nameParts.length >= 2) {
      return { 
        firstName: nameParts[0], 
        lastName: nameParts.slice(1).join(' ') 
      };
    }
    
    return { firstName: 'Unknown', lastName: 'Practitioner' };
  };

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
      return;
    }

    if (status === 'authenticated' && session?.user?.role !== 'admin') {
      router.push('/dashboard');
      return;
    }

    fetchPractitioners();
  }, [session, status, router]);

  const fetchPractitioners = async () => {
    try {
      const response = await fetch('http://localhost:3001/practitioners');
      const data = await response.json();
      setPractitioners(data);
    } catch (error) {
      console.error('Error fetching practitioners:', error);
    } finally {
      setLoading(false);
    }
  };

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-gray-50">
      <Sidebar />
      
      <div className="flex-1 overflow-auto">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                <Users className="h-8 w-8 text-blue-600" />
                Practitioners Management
              </h1>
              <p className="text-gray-600 mt-1">
                Manage all healthcare practitioners across the clinic
              </p>
            </div>
            <Button>
              <UserPlus className="h-4 w-4 mr-2" />
              Add Practitioner
            </Button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Practitioners</p>
                    <p className="text-2xl font-bold text-gray-900">{practitioners.length}</p>
                  </div>
                  <Users className="h-8 w-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Active Today</p>
                    <p className="text-2xl font-bold text-gray-900">{practitioners.filter(p => p.availability).length}</p>
                  </div>
                  <Activity className="h-8 w-8 text-green-600" />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Avg Rating</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {practitioners.length > 0 
                        ? (practitioners.reduce((acc, p) => acc + (p.rating || 0), 0) / practitioners.length).toFixed(1)
                        : 'N/A'
                      }
                    </p>
                  </div>
                  <Star className="h-8 w-8 text-yellow-600" />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Specialties</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {new Set(practitioners.flatMap(p => p.specialties || [])).size}
                    </p>
                  </div>
                  <Calendar className="h-8 w-8 text-purple-600" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Practitioners List */}
          <Card>
            <CardHeader>
              <CardTitle>All Practitioners</CardTitle>
              <CardDescription>Complete list of healthcare providers</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {practitioners.length === 0 ? (
                  <div className="text-center py-8">
                    <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">No practitioners found. Check your database connection.</p>
                  </div>
                ) : (
                  practitioners.map((practitioner) => {
                    const { firstName, lastName } = extractNames(practitioner.name);
                    return (
                      <div key={practitioner.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                        <div className="flex items-center gap-4">
                          <Avatar className="h-12 w-12">
                            <AvatarFallback className="bg-blue-100 text-blue-600">
                              {firstName?.[0] || '?'}{lastName?.[0] || ''}
                            </AvatarFallback>
                          </Avatar>
                          
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <h3 className="font-semibold text-gray-900">
                                {practitioner.name || `Dr. ${firstName} ${lastName}`}
                              </h3>
                              <div className="flex items-center gap-1">
                                <Star className="h-4 w-4 text-yellow-500 fill-current" />
                                <span className="text-sm text-gray-600">{practitioner.rating || 'N/A'}</span>
                              </div>
                            </div>
                            
                            <div className="flex items-center gap-4 mt-1 text-sm text-gray-600">
                              <div className="flex items-center gap-1">
                                <Mail className="h-4 w-4" />
                                {practitioner.email || 'No email'}
                              </div>
                              {practitioner.phone && (
                                <div className="flex items-center gap-1">
                                  <Phone className="h-4 w-4" />
                                  {practitioner.phone}
                                </div>
                              )}
                              <div className="flex items-center gap-1">
                                <Clock className="h-4 w-4" />
                                {practitioner.experience || 0}+ years
                              </div>
                            </div>
                            
                            <div className="flex flex-wrap gap-2 mt-2">
                              {(practitioner.specialties || []).map((specialty) => (
                                <Badge key={specialty} variant="outline" className="text-xs">
                                  {specialty}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          {(practitioner.consultationTypes || []).map((type) => (
                            <Badge key={type} variant="secondary" className="text-xs">
                              {type}
                            </Badge>
                          ))}
                          <Button variant="outline" size="sm">
                            Edit
                          </Button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}