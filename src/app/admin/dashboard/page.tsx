'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useDashboardMetrics, useTodaysAppointments, useAppointmentAnalytics } from '@/hooks/useAppointments';
import { useNotifications, getNotificationStyle } from '@/hooks/useNotifications';
import { Sidebar } from '@/components/Sidebar';
import { MetricCard } from '@/components/MetricCard';
import { AppointmentCard } from '@/components/AppointmentCard';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton, SkeletonMetrics, SkeletonList } from '@/components/ui/skeleton';
import { LoadingSpinner } from '@/components/ui/spinner';
import { 
  Calendar, 
  Clock, 
  Users, 
  Stethoscope, 
  UserPlus, 
  FileText, 
  Bell, 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle,
  Shield,
  Settings,
  BarChart3,
  UserCheck,
  Building
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';
import { format } from 'date-fns';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

// Type definitions
interface Practitioner {
  id: string;
  name: string; // Full name like "Dr. Sarah Chen"
  firstName?: string; // Optional for backward compatibility
  lastName?: string; // Optional for backward compatibility
  email?: string;
  specialties?: string[];
  availability?: boolean;
  rating?: number;
}

interface Clinic {
  id: string;
  name: string;
  address?: string;
  phone?: string;
  email?: string;
}

export default function AdminDashboard() {
  const { data: session, status } = useSession();
  const { user, isAuthenticated, isLoading, login } = useAuth();
  const { data: metrics, isLoading: metricsLoading } = useDashboardMetrics();
  const { data: analyticsData, isLoading: analyticsLoading } = useAppointmentAnalytics();
  const { recentNotifications, loading: notificationsLoading } = useNotifications();
  const { 
    appointments: todaysAppointments, 
    loading: appointmentsLoading,
    updateAppointmentStatus,
    updateAppointmentNotes
  } = useTodaysAppointments();
  const router = useRouter();

  // Real-time data states
  const [practitioners, setPractitioners] = useState<Practitioner[]>([]);
  const [clinics, setClinics] = useState<Clinic[]>([]);
  const [realTimeMetrics, setRealTimeMetrics] = useState({
    activePractitioners: 0,
    totalClinics: 0,
    availablePractitioners: 0
  });
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

  // Fetch real-time data
  const fetchRealTimeData = async () => {
    try {
      const [practitionersRes, clinicsRes] = await Promise.all([
        fetch('http://localhost:3001/practitioners'),
        fetch('http://localhost:3001/clinics')
      ]);

      if (practitionersRes.ok && clinicsRes.ok) {
        const [practitionersData, clinicsData] = await Promise.all([
          practitionersRes.json(),
          clinicsRes.json()
        ]);

        setPractitioners(practitionersData);
        setClinics(clinicsData);

        // Calculate real metrics
        const activePractitioners = practitionersData.length;
        const availableToday = practitionersData.filter((p: Practitioner) => p.availability).length;
        
        setRealTimeMetrics({
          activePractitioners,
          totalClinics: clinicsData.length,
          availablePractitioners: availableToday
        });
      }
    } catch (error) {
      console.error('Error fetching real-time data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (status === 'loading' || isLoading) return;
    
    if (status === 'unauthenticated' || !session) {
      router.push('/auth/signin');
      return;
    }

    // Check if user has admin role
    const userRole = session.user?.role;
    if (userRole !== 'admin') {
      console.log('❌ Admin Dashboard: Access denied. User role:', userRole);
      // Redirect based on actual role
      switch (userRole) {
        case 'staff':
        case 'practitioner':
          router.push('/staff/dashboard');
          break;
        case 'patient':
          router.push('/patient/dashboard');
          break;
        default:
          router.push('/dashboard');
      }
      return;
    }

    // Sync session to Zustand store if needed
    if (status === 'authenticated' && session?.user && !isAuthenticated) {
      const userData = {
        id: session.user.id || session.user.email || 'unknown',
        name: session.user.name || 'Unknown User',
        email: session.user.email || '',
        role: (session.user.role as any) || 'admin',
        clinicId: session.user.clinicId,
        image: session.user.image,
      };
      login(userData);
    }

    // Fetch real-time data
    fetchRealTimeData();
  }, [session, status, isAuthenticated, user, isLoading, router, login]);

  if (status === 'loading' || isLoading || loading) {
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
    role: (session.user?.role as any) || 'admin',
    clinicId: session.user?.clinicId,
    image: session.user?.image,
  };

  const handleAppointmentAction = (appointmentId: string, action: string) => {
    switch (action) {
      case 'call':
        console.log('Calling patient for appointment:', appointmentId);
        break;
      case 'message':
        console.log('Messaging patient for appointment:', appointmentId);
        break;
      default:
        console.log('Unknown action:', action);
    }
  };

  const handleNotesUpdate = (appointmentId: string, notes: string) => {
    updateAppointmentNotes(appointmentId, notes);
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
              <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                <Shield className="h-8 w-8 text-blue-600" />
                Administrator Dashboard
              </h1>
              <p className="text-gray-600 mt-1">
                Welcome back, {currentUser?.name} • Managing all clinic operations
              </p>
              <div className="mt-2">
                <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                  <Shield className="h-3 w-3 mr-1" />
                  Administrator Access - All Data Visible
                </Badge>
              </div>
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
          {/* Enhanced Admin Metrics */}
          {metricsLoading || loading ? (
            <SkeletonMetrics />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <MetricCard
                title="Today's Appointments"
                value={metrics?.todaysAppointments ?? 0}
                icon={Calendar}
                iconColor="text-blue-600"
                change={{ value: '+12%', trend: 'up' }}
              />
              <MetricCard
                title="Active Practitioners"
                value={realTimeMetrics.activePractitioners}
                icon={UserCheck}
                iconColor="text-green-600"
                change={{ value: `${realTimeMetrics.availablePractitioners} available today`, trend: 'neutral' }}
              />
              <MetricCard
                title="Total Patients"
                value={metrics?.totalPatients ?? 0}
                icon={Users}
                iconColor="text-purple-600"
                change={{ value: '+15 this week', trend: 'up' }}
              />
              <MetricCard
                title="Clinic Locations"
                value={realTimeMetrics.totalClinics}
                icon={Building}
                iconColor="text-orange-600"
                change={{ value: 'All active', trend: 'neutral' }}
              />
            </div>
          )}

          {/* Admin Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Administrative Controls
              </CardTitle>
              <CardDescription>System management and configuration</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                <Button variant="outline" className="h-20 flex-col gap-2">
                  <UserPlus className="h-6 w-6" />
                  <span className="text-sm">Add Staff</span>
                </Button>
                <Button variant="outline" className="h-20 flex-col gap-2">
                  <Stethoscope className="h-6 w-6" />
                  <span className="text-sm">Manage Practitioners</span>
                </Button>
                <Button variant="outline" className="h-20 flex-col gap-2">
                  <Building className="h-6 w-6" />
                  <span className="text-sm">Clinic Settings</span>
                </Button>
                <Button variant="outline" className="h-20 flex-col gap-2">
                  <BarChart3 className="h-6 w-6" />
                  <span className="text-sm">Reports</span>
                </Button>
                <Button variant="outline" className="h-20 flex-col gap-2">
                  <Settings className="h-6 w-6" />
                  <span className="text-sm">System Config</span>
                </Button>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* System Overview */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle>System Overview</CardTitle>
                    <CardDescription>
                      Real-time clinic operations and status
                    </CardDescription>
                  </div>
                  <Button variant="outline" size="sm">
                    View Details
                  </Button>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Today's Appointments Summary */}
                  <div>
                    <h4 className="font-semibold mb-3">Today's Appointments</h4>
                    {appointmentsLoading ? (
                      <SkeletonList count={3} />
                    ) : todaysAppointments.length === 0 ? (
                      <div className="text-center py-4">
                        <Calendar className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                        <p className="text-gray-600">No appointments scheduled today</p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {todaysAppointments.slice(0, 3).map((appointment) => (
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
                            onNotesUpdate={handleNotesUpdate}
                          />
                        ))}
                        {todaysAppointments.length > 3 && (
                          <div className="text-center pt-2">
                            <Button variant="outline" size="sm">
                              View all {todaysAppointments.length} appointments
                            </Button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Practitioner Status */}
                  <div>
                    <h4 className="font-semibold mb-3">Practitioner Status</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {practitioners.length === 0 ? (
                        <div className="col-span-2 text-center py-4">
                          <p className="text-gray-600">Loading practitioner status...</p>
                        </div>
                      ) : (
                        practitioners.slice(0, 4).map((practitioner, index) => {
                          const statuses = ['available', 'busy', 'break', 'off'];
                          const status = statuses[index % statuses.length];
                          const statusConfig = {
                            available: { bg: 'bg-green-50', text: 'text-green-900', desc: 'text-green-700', dot: 'bg-green-500', label: 'Available' },
                            busy: { bg: 'bg-blue-50', text: 'text-blue-900', desc: 'text-blue-700', dot: 'bg-blue-500', label: 'In Session' },
                            break: { bg: 'bg-yellow-50', text: 'text-yellow-900', desc: 'text-yellow-700', dot: 'bg-yellow-500', label: 'Break' },
                            off: { bg: 'bg-gray-50', text: 'text-gray-900', desc: 'text-gray-700', dot: 'bg-gray-500', label: 'Off Today' }
                          };
                          const config = statusConfig[status as keyof typeof statusConfig];
                          const { firstName, lastName } = extractNames(practitioner.name);
                          
                          return (
                            <div key={practitioner.id} className={`flex items-center justify-between p-3 ${config.bg} rounded-lg`}>
                              <div>
                                <p className={`font-medium ${config.text}`}>
                                  {practitioner.name || `Dr. ${firstName} ${lastName}`}
                                </p>
                                <p className={`text-sm ${config.desc}`}>
                                  {config.label} {status === 'available' && '• Next: 2:30 PM'}
                                  {status === 'busy' && '• Until 3:00 PM'}
                                  {status === 'break' && '• Back 3:15 PM'}
                                </p>
                              </div>
                              <div className={`h-3 w-3 ${config.dot} rounded-full`}></div>
                            </div>
                          );
                        })
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Sidebar Content */}
            <div className="space-y-6">
              {/* System Alerts */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5 text-orange-500" />
                    System Alerts
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-start gap-3 p-3 bg-orange-50 rounded-lg">
                    <AlertTriangle className="h-5 w-5 text-orange-500 mt-0.5" />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-orange-900">Server Load High</p>
                      <p className="text-xs text-orange-700">Current: 87% • Consider scaling</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg">
                    <CheckCircle className="h-5 w-5 text-blue-500 mt-0.5" />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-blue-900">Backup Completed</p>
                      <p className="text-xs text-blue-700">All data backed up successfully</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-3 bg-yellow-50 rounded-lg">
                    <AlertTriangle className="h-5 w-5 text-yellow-500 mt-0.5" />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-yellow-900">License Renewal</p>
                      <p className="text-xs text-yellow-700">Due in 15 days</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Recent Notifications */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Bell className="h-5 w-5" />
                    Recent Activity
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {notificationsLoading ? (
                    <div className="text-gray-500 text-sm">Loading notifications...</div>
                  ) : recentNotifications.length === 0 ? (
                    <div className="text-gray-500 text-sm">No recent activity</div>
                  ) : (
                    recentNotifications.slice(0, 4).map((notification) => {
                      const style = getNotificationStyle(notification.type);
                      return (
                        <div key={notification.id} className={`flex items-start gap-3 p-3 ${style.bgColor} rounded-lg`}>
                          <Bell className={`h-4 w-4 ${style.iconColor} mt-0.5`} />
                          <div className="flex-1">
                            <p className={`text-sm font-medium ${style.textColor}`}>{notification.title}</p>
                            <p className={`text-xs ${style.descColor}`}>{notification.message}</p>
                          </div>
                        </div>
                      );
                    })
                  )}
                </CardContent>
              </Card>

              {/* Clinic Performance */}
              <Card>
                <CardHeader>
                  <CardTitle>Performance Metrics</CardTitle>
                  <CardDescription>This month's overview</CardDescription>
                </CardHeader>
                <CardContent>
                  {analyticsLoading ? (
                    <div className="h-[200px] space-y-4">
                      <Skeleton className="h-6 w-32" />
                      <Skeleton className="h-32 w-full" />
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Patient Satisfaction</span>
                        <span className="text-sm font-semibold text-green-600">94%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div className="bg-green-500 h-2 rounded-full" style={{ width: '94%' }}></div>
                      </div>
                      
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Appointment Efficiency</span>
                        <span className="text-sm font-semibold text-blue-600">87%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div className="bg-blue-500 h-2 rounded-full" style={{ width: '87%' }}></div>
                      </div>

                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Revenue Target</span>
                        <span className="text-sm font-semibold text-purple-600">76%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div className="bg-purple-500 h-2 rounded-full" style={{ width: '76%' }}></div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}