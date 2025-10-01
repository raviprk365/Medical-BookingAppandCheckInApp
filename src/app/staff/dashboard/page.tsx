'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useDashboardMetrics, useTodaysAppointments } from '@/hooks/useAppointments';
import { Sidebar } from '@/components/Sidebar';
import { MetricCard } from '@/components/MetricCard';
import { AppointmentCard } from '@/components/AppointmentCard';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, Users, Stethoscope, UserPlus, FileText, Bell, TrendingUp, AlertTriangle, CheckCircle } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { format } from 'date-fns';

// Sample data for charts
const appointmentTrends = [
  { name: 'Mon', appointments: 24 },
  { name: 'Tue', appointments: 30 },
  { name: 'Wed', appointments: 28 },
  { name: 'Thu', appointments: 32 },
  { name: 'Fri', appointments: 26 },
  { name: 'Sat', appointments: 18 },
  { name: 'Sun', appointments: 12 }
];

const statusDistribution = [
  { name: 'Completed', value: 15, fill: '#10b981' },
  { name: 'Confirmed', value: 8, fill: '#3b82f6' },
  { name: 'Waiting', value: 3, fill: '#f59e0b' },
  { name: 'Cancelled', value: 2, fill: '#ef4444' }
];

export default function StaffDashboard() {
  const { data: session, status } = useSession();
  const { user, isAuthenticated, isLoading, login } = useAuth();
  const { metrics, loading: metricsLoading } = useDashboardMetrics();
  const { 
    appointments: todaysAppointments, 
    loading: appointmentsLoading,
    updateAppointmentStatus 
  } = useTodaysAppointments();
  const router = useRouter();

  useEffect(() => {
    if (status === 'loading' || isLoading) return;
    
    if (status === 'unauthenticated' || !session) {
      router.push('/auth/signin');
      return;
    }

    // Sync session to Zustand store if needed
    if (status === 'authenticated' && session?.user && !isAuthenticated) {
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

  // Use session data as fallback
  const currentUser = user || {
    id: session.user?.id || session.user?.email || 'unknown',
    name: session.user?.name || 'Unknown User',
    email: session.user?.email || '',
    role: (session.user?.role as any) || 'staff',
    clinicId: session.user?.clinicId,
    image: session.user?.image,
  };

  const handleAppointmentAction = (appointmentId: string, action: string) => {
    switch (action) {
      case 'call':
        // Implement call functionality
        console.log('Calling patient for appointment:', appointmentId);
        break;
      case 'message':
        // Implement messaging functionality
        console.log('Messaging patient for appointment:', appointmentId);
        break;
      default:
        console.log('Unknown action:', action);
    }
  };

  return (
    <div className="min-h-screen flex bg-gray-50">
      {/* Sidebar */}
      <Sidebar />
      
      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Good {new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 18 ? 'afternoon' : 'evening'}, {currentUser?.name}
              </h1>
              <p className="text-gray-600 mt-1">
                Here's what's happening at your clinic today
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="outline" size="sm">
                <Bell className="h-4 w-4 mr-2" />
                Notifications
                <Badge className="ml-2 bg-red-500">3</Badge>
              </Button>
              <div className="text-sm text-gray-500">
                {format(new Date(), 'EEEE, MMMM do, yyyy')}
              </div>
            </div>
          </div>
        </div>

        {/* Dashboard Content */}
        <div className="p-6 space-y-6">
          {/* Metrics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <MetricCard
              title="Today's Appointments"
              value={metricsLoading ? '...' : metrics.todaysAppointments}
              icon={Calendar}
              iconColor="text-blue-600"
              change={{ value: '+12%', trend: 'up' }}
            />
            <MetricCard
              title="Patients Waiting"
              value={metricsLoading ? '...' : metrics.waitingPatients}
              icon={Clock}
              iconColor="text-yellow-600"
              change={{ value: '2 min avg', trend: 'neutral' }}
            />
            <MetricCard
              title="Completed Today"
              value={metricsLoading ? '...' : metrics.completedToday}
              icon={CheckCircle}
              iconColor="text-green-600"
              change={{ value: '+8%', trend: 'up' }}
            />
            <MetricCard
              title="Total Patients"
              value={metricsLoading ? '...' : metrics.totalPatients}
              icon={Users}
              iconColor="text-purple-600"
              change={{ value: '+5 new', trend: 'up' }}
            />
          </div>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>Frequently used shortcuts</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Button variant="outline" className="h-20 flex-col gap-2">
                  <UserPlus className="h-6 w-6" />
                  <span className="text-sm">Add Patient</span>
                </Button>
                <Button variant="outline" className="h-20 flex-col gap-2">
                  <Calendar className="h-6 w-6" />
                  <span className="text-sm">New Appointment</span>
                </Button>
                <Button variant="outline" className="h-20 flex-col gap-2">
                  <FileText className="h-6 w-6" />
                  <span className="text-sm">Medical Records</span>
                </Button>
                <Button variant="outline" className="h-20 flex-col gap-2">
                  <TrendingUp className="h-6 w-6" />
                  <span className="text-sm">Reports</span>
                </Button>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Today's Appointments Overview */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle>Today's Appointments</CardTitle>
                    <CardDescription>
                      {format(new Date(), 'EEEE, MMMM do')} • {todaysAppointments.length} appointments
                    </CardDescription>
                  </div>
                  <Button variant="outline" size="sm">
                    View All
                  </Button>
                </CardHeader>
                <CardContent className="space-y-4">
                  {appointmentsLoading ? (
                    <div className="flex items-center justify-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    </div>
                  ) : todaysAppointments.length === 0 ? (
                    <div className="text-center py-8">
                      <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">No appointments today</h3>
                      <p className="text-gray-600">Your schedule is clear for today</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {todaysAppointments.slice(0, 4).map((appointment) => (
                        <AppointmentCard
                          key={appointment.id}
                          appointment={{
                            id: appointment.id,
                            patientName: appointment.patientName,
                            time: appointment.appointmentTime,
                            duration: appointment.duration,
                            type: appointment.appointmentType,
                            doctor: appointment.practitionerName,
                            status: appointment.status,
                            reason: appointment.reason,
                            phone: appointment.patientPhone,
                            notes: appointment.notes
                          }}
                          onStatusChange={updateAppointmentStatus}
                          onContact={handleAppointmentAction}
                        />
                      ))}
                      {todaysAppointments.length > 4 && (
                        <div className="text-center pt-4">
                          <Button variant="outline" size="sm">
                            View {todaysAppointments.length - 4} more appointments
                          </Button>
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Sidebar Content */}
            <div className="space-y-6">
              {/* Notifications */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Bell className="h-5 w-5" />
                    Notifications
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-start gap-3 p-3 bg-orange-50 rounded-lg">
                    <AlertTriangle className="h-5 w-5 text-orange-600 mt-0.5" />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-orange-900">Patient running late</p>
                      <p className="text-xs text-orange-700">John Doe - 10:30 AM appointment</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg">
                    <FileText className="h-5 w-5 text-blue-600 mt-0.5" />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-blue-900">Lab results received</p>
                      <p className="text-xs text-blue-700">3 new results to review</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-3 bg-green-50 rounded-lg">
                    <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-green-900">Patient checked in</p>
                      <p className="text-xs text-green-700">Sarah Johnson - 2:00 PM</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Charts */}
              <Card>
                <CardHeader>
                  <CardTitle>Appointment Trends</CardTitle>
                  <CardDescription>This week's appointments</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={200}>
                    <LineChart data={appointmentTrends}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Line type="monotone" dataKey="appointments" stroke="#3b82f6" strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Status Distribution */}
              <Card>
                <CardHeader>
                  <CardTitle>Today's Status</CardTitle>
                  <CardDescription>Appointment status breakdown</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={200}>
                    <BarChart data={statusDistribution}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="value" fill="#8884d8" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
