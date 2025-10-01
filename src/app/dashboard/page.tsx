'use client';

import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  User, 
  Mail, 
  Shield, 
  Building, 
  Calendar, 
  Settings, 
  LogOut,
  Bell,
  Clock,
  UserCheck,
  Activity
} from 'lucide-react';

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
    }
  }, [status, router]);

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  const handleSignOut = async () => {
    await signOut({ 
      callbackUrl: '/',
      redirect: true 
    });
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'doctor':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'staff':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'patient':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getRolePermissions = (role: string) => {
    switch (role) {
      case 'admin':
        return [
          'Manage all users and settings',
          'View all appointments and records',
          'Access analytics and reports',
          'Manage clinic configuration'
        ];
      case 'doctor':
        return [
          'View and manage patient appointments',
          'Access patient medical records',
          'Update appointment notes',
          'Manage personal schedule'
        ];
      case 'staff':
        return [
          'Manage appointment bookings',
          'Check-in patients',
          'View appointment schedules',
          'Update patient information'
        ];
      case 'patient':
        return [
          'Book and manage appointments',
          'View personal medical history',
          'Update personal information',
          'Access test results'
        ];
      default:
        return [];
    }
  };

  const getQuickActions = (role: string) => {
    switch (role) {
      case 'admin':
        return [
          { label: 'User Management', icon: UserCheck, href: '/admin/users' },
          { label: 'System Settings', icon: Settings, href: '/admin/settings' },
          { label: 'Analytics', icon: Activity, href: '/admin/analytics' },
          { label: 'Clinic Config', icon: Building, href: '/admin/clinics' },
        ];
      case 'doctor':
        return [
          { label: 'Today\'s Appointments', icon: Calendar, href: '/doctor/appointments' },
          { label: 'Patient Records', icon: User, href: '/doctor/patients' },
          { label: 'My Schedule', icon: Clock, href: '/doctor/schedule' },
          { label: 'Settings', icon: Settings, href: '/doctor/settings' },
        ];
      case 'staff':
        return [
          { label: 'Appointment Management', icon: Calendar, href: '/staff/appointments' },
          { label: 'Patient Check-in', icon: UserCheck, href: '/staff/checkin' },
          { label: 'Today\'s Schedule', icon: Clock, href: '/staff/schedule' },
          { label: 'Reports', icon: Activity, href: '/staff/reports' },
        ];
      case 'patient':
        return [
          { label: 'Book Appointment', icon: Calendar, href: '/booking' },
          { label: 'My Appointments', icon: Clock, href: '/patient/appointments' },
          { label: 'Medical Records', icon: User, href: '/patient/records' },
          { label: 'Profile Settings', icon: Settings, href: '/patient/profile' },
        ];
      default:
        return [];
    }
  };

  const quickActions = getQuickActions(session.user.role);
  const permissions = getRolePermissions(session.user.role);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
              <Badge className={getRoleColor(session.user.role)}>
                {session.user.role.charAt(0).toUpperCase() + session.user.role.slice(1)}
              </Badge>
            </div>
            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="sm">
                <Bell className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="sm" onClick={handleSignOut}>
                <LogOut className="h-4 w-4 mr-2" />
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* User Profile Card */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <User className="h-5 w-5" />
                  <span>Profile Information</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-4">
                  <Avatar className="h-16 w-16">
                    <AvatarImage src={session.user.image || ''} />
                    <AvatarFallback className="text-lg">
                      {session.user.name?.split(' ').map(n => n[0]).join('') || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="font-semibold text-lg">{session.user.name}</h3>
                    <p className="text-sm text-muted-foreground flex items-center">
                      <Mail className="h-4 w-4 mr-1" />
                      {session.user.email}
                    </p>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Role:</span>
                    <Badge className={getRoleColor(session.user.role)}>
                      {session.user.role.charAt(0).toUpperCase() + session.user.role.slice(1)}
                    </Badge>
                  </div>
                  
                  {session.user.clinicId && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Clinic ID:</span>
                      <span className="text-sm text-muted-foreground flex items-center">
                        <Building className="h-4 w-4 mr-1" />
                        {session.user.clinicId}
                      </span>
                    </div>
                  )}

                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">User ID:</span>
                    <span className="text-sm text-muted-foreground font-mono">
                      {session.user.id}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Permissions Card */}
            <Card className="mt-6">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Shield className="h-5 w-5" />
                  <span>Permissions</span>
                </CardTitle>
                <CardDescription>
                  What you can do with your {session.user.role} account
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {permissions.map((permission, index) => (
                    <li key={index} className="flex items-start space-x-2">
                      <div className="w-1.5 h-1.5 bg-primary rounded-full mt-2 flex-shrink-0" />
                      <span className="text-sm text-muted-foreground">{permission}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
                <CardDescription>
                  Common tasks for your role
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {quickActions.map((action, index) => (
                    <Button
                      key={index}
                      variant="outline"
                      className="h-20 flex flex-col items-center space-y-2 hover:bg-primary/5"
                      onClick={() => router.push(action.href)}
                    >
                      <action.icon className="h-6 w-6" />
                      <span className="text-sm font-medium">{action.label}</span>
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Welcome Message */}
            <Card className="mt-6">
              <CardHeader>
                <CardTitle>Welcome to Sydney Med</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <p className="text-muted-foreground">
                    Hello {session.user.name}! You're logged in as a{' '}
                    <span className="font-medium">{session.user.role}</span>.
                  </p>
                  
                  {session.user.role === 'patient' && (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <h4 className="font-medium text-blue-900 mb-2">Getting Started</h4>
                      <p className="text-sm text-blue-700">
                        Ready to book your first appointment? Click "Book Appointment" above to get started 
                        with our easy-to-use booking system.
                      </p>
                    </div>
                  )}

                  {session.user.role === 'doctor' && (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                      <h4 className="font-medium text-green-900 mb-2">Practice Management</h4>
                      <p className="text-sm text-green-700">
                        Access your appointment schedule, patient records, and manage your 
                        availability through the quick actions above.
                      </p>
                    </div>
                  )}

                  {session.user.role === 'staff' && (
                    <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                      <h4 className="font-medium text-purple-900 mb-2">Front Desk Operations</h4>
                      <p className="text-sm text-purple-700">
                        Manage patient check-ins, appointment bookings, and access today's 
                        schedule to keep operations running smoothly.
                      </p>
                    </div>
                  )}

                  {session.user.role === 'admin' && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                      <h4 className="font-medium text-red-900 mb-2">System Administration</h4>
                      <p className="text-sm text-red-700">
                        You have full access to user management, system settings, and analytics. 
                        Use the quick actions to manage the practice efficiently.
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
