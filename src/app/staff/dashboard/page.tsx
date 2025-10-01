'use client';

import { signOut, useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, Users, Stethoscope, Settings, BarChart3, UserPlus, FileText, Phone, Bell } from 'lucide-react';

export default function StaffDashboard() {
  const { data: session, status } = useSession();
  const { user, isAuthenticated, isLoading, login } = useAuth();
  const router = useRouter();

  useEffect(() => {
    console.log('📊 Dashboard: Session status:', status);
    console.log('📊 Dashboard: Session data:', session);
    console.log('📊 Dashboard: Zustand auth state:', { isAuthenticated, user, isLoading });

    if (status === 'loading' || isLoading) return;
    
    if (status === 'unauthenticated' || !session) {
      console.log('📊 Dashboard: Not authenticated, redirecting to signin');
      router.push('/auth/signin');
      return;
    }

    // If we have a session but no user in Zustand store, sync them
    if (status === 'authenticated' && session?.user && !isAuthenticated) {
      console.log('📊 Dashboard: Syncing session to Zustand store');
      const userData = {
        id: session.user.id || session.user.email || 'unknown',
        name: session.user.name || 'Unknown User',
        email: session.user.email || '',
        role: (session.user.role as any) || 'staff',
        clinicId: session.user.clinicId,
        image: session.user.image,
      };
      login(userData);
    }
    
    console.log('📊 Dashboard: Authentication verified');
  }, [session, status, isAuthenticated, user, isLoading, router, login]);

  if (status === 'loading' || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (status === 'unauthenticated' || !session) {
    return null;
  }

  // Use session data as fallback if Zustand store is not yet populated
  const currentUser = user || {
    id: session.user?.id || session.user?.email || 'unknown',
    name: session.user?.name || 'Unknown User',
    email: session.user?.email || '',
    role: (session.user?.role as any) || 'staff',
    clinicId: session.user?.clinicId,
    image: session.user?.image,
  };

  const todaysAppointments = [
    {
      id: 1,
      patient: 'John Doe',
      time: '9:00 AM',
      type: 'General Consultation',
      doctor: 'Dr. Sarah Chen',
      status: 'confirmed',
      duration: '30 min'
    },
    {
      id: 2,
      patient: 'Sarah Johnson',
      time: '10:30 AM',
      type: 'Follow-up',
      doctor: 'Dr. Sarah Chen',
      status: 'waiting',
      duration: '15 min'
    },
    {
      id: 3,
      patient: 'Michael Chen',
      time: '2:00 PM',
      type: 'Health Check',
      doctor: 'Dr. James Mitchell',
      status: 'confirmed',
      duration: '45 min'
    }
  ];

  const stats = {
    totalPatients: 156,
    todaysAppointments: todaysAppointments.length,
    pendingApprovals: 5,
    completedToday: 8
  };

  const getRoleDisplayName = (role: string) => {
    switch (role) {
      case 'admin': return 'Administrator';
      case 'doctor': return 'Doctor';
      case 'nurse': return 'Nurse';
      case 'staff': return 'Staff Member';
      default: return 'Staff';
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin': return 'bg-red-100 text-red-800';
      case 'doctor': return 'bg-blue-100 text-blue-800';
      case 'nurse': return 'bg-green-100 text-green-800';
      case 'staff': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />
      
      <main className="flex-1 container mx-auto px-4 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Welcome, {currentUser?.name}
              </h1>
              <div className="flex items-center gap-2">
                <Badge className={getRoleColor(currentUser?.role || '')}>
                  {getRoleDisplayName(currentUser?.role || '')}
                </Badge>
                {currentUser?.clinicId && (
                  <Badge variant="outline">Sydney CBD Medical Centre</Badge>
                )}
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                <Bell className="h-4 w-4 mr-2" />
                Notifications
              </Button>
              {currentUser?.role === 'admin' && (
                <Button variant="outline" size="sm">
                  <Settings className="h-4 w-4 mr-2" />
                  Admin Panel
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Patients</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalPatients}</p>
                </div>
                <Users className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Today's Appointments</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.todaysAppointments}</p>
                </div>
                <Calendar className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Pending Approvals</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.pendingApprovals}</p>
                </div>
                <FileText className="h-8 w-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Completed Today</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.completedToday}</p>
                </div>
                <Stethoscope className="h-8 w-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <CardContent className="p-4 text-center">
              <UserPlus className="h-6 w-6 text-blue-600 mx-auto mb-2" />
              <h3 className="font-medium text-sm">Add Patient</h3>
            </CardContent>
          </Card>
          
          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <CardContent className="p-4 text-center">
              <Calendar className="h-6 w-6 text-green-600 mx-auto mb-2" />
              <h3 className="font-medium text-sm">Schedule Appointment</h3>
            </CardContent>
          </Card>
          
          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <CardContent className="p-4 text-center">
              <FileText className="h-6 w-6 text-purple-600 mx-auto mb-2" />
              <h3 className="font-medium text-sm">Medical Records</h3>
            </CardContent>
          </Card>
          
          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <CardContent className="p-4 text-center">
              <BarChart3 className="h-6 w-6 text-orange-600 mx-auto mb-2" />
              <h3 className="font-medium text-sm">Reports</h3>
            </CardContent>
          </Card>
          
          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <CardContent className="p-4 text-center">
              <Settings className="h-6 w-6 text-gray-600 mx-auto mb-2" />
              <h3 className="font-medium text-sm">Settings</h3>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Today's Schedule */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Today's Schedule
                </CardTitle>
                <CardDescription>Appointments for {new Date().toLocaleDateString('en-AU')}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {todaysAppointments.map((appointment) => (
                  <div key={appointment.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-semibold text-gray-900">{appointment.patient}</h4>
                        <Badge variant={appointment.status === 'confirmed' ? 'default' : 
                                      appointment.status === 'waiting' ? 'secondary' : 'outline'}>
                          {appointment.status}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600 mb-1">{appointment.type} • {appointment.duration}</p>
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <span className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          {appointment.time}
                        </span>
                        <span className="flex items-center gap-1">
                          <Stethoscope className="h-4 w-4" />
                          {appointment.doctor}
                        </span>
                      </div>
                    </div>
                    <div className="flex gap-2 ml-4">
                      {appointment.status === 'waiting' && (
                        <Button size="sm">Check In</Button>
                      )}
                      <Button variant="outline" size="sm">
                        <Phone className="h-4 w-4 mr-1" />
                        Call
                      </Button>
                    </div>
                  </div>
                ))}
                
                {todaysAppointments.length === 0 && (
                  <div className="text-center py-8">
                    <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No appointments today</h3>
                    <p className="text-gray-600">Your schedule is clear for today</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Pending Tasks */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Pending Tasks
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
                  <div>
                    <p className="text-sm font-medium">New patient registrations</p>
                    <p className="text-xs text-gray-600">3 pending approval</p>
                  </div>
                  <Badge variant="secondary">3</Badge>
                </div>
                
                <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                  <div>
                    <p className="text-sm font-medium">Lab results review</p>
                    <p className="text-xs text-gray-600">2 results to review</p>
                  </div>
                  <Badge variant="secondary">2</Badge>
                </div>
                
                <Button variant="outline" size="sm" className="w-full">
                  View All Tasks
                </Button>
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-2 h-2 bg-green-600 rounded-full mt-2"></div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-900">Patient checked in for 2:00 PM appointment</p>
                    <p className="text-xs text-gray-500">5 minutes ago</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-2 h-2 bg-blue-600 rounded-full mt-2"></div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-900">New appointment scheduled for tomorrow</p>
                    <p className="text-xs text-gray-500">1 hour ago</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-2 h-2 bg-purple-600 rounded-full mt-2"></div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-900">Patient profile updated</p>
                    <p className="text-xs text-gray-500">2 hours ago</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* System Status */}
            {currentUser?.role === 'admin' && (
              <Card>
                <CardHeader>
                  <CardTitle>System Status</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Database</span>
                    <Badge className="bg-green-100 text-green-800">Online</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Backup</span>
                    <Badge className="bg-green-100 text-green-800">Current</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Security</span>
                    <Badge className="bg-green-100 text-green-800">Secure</Badge>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}
