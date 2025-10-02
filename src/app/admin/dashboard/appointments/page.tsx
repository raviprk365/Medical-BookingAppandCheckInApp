'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Sidebar } from '@/components/Sidebar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  CalendarDays, 
  Clock, 
  Users, 
  CheckCircle,
  XCircle,
  AlertCircle,
  Calendar,
  Filter
} from 'lucide-react';
import { format } from 'date-fns';

interface Appointment {
  id: string;
  patientId: string;
  practitionerId: string;
  appointmentDate: string;
  appointmentTime: string;
  duration: number;
  appointmentType: string;
  status: string;
  reason: string;
  notes?: string;
  patientName?: string;
  practitionerName?: string;
}

export default function AdminAppointments() {
  const { data: session, status } = useSession();
  const { user } = useAuth();
  const router = useRouter();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
      return;
    }

    if (status === 'authenticated' && session?.user?.role !== 'admin') {
      router.push('/dashboard');
      return;
    }

    fetchAppointments();
  }, [session, status, router]);

  const fetchAppointments = async () => {
    try {
      const [appointmentsRes, patientsRes, practitionersRes] = await Promise.all([
        fetch('http://localhost:3001/appointments'),
        fetch('http://localhost:3001/patients'),
        fetch('http://localhost:3001/practitioners')
      ]);

      const [appointmentsData, patientsData, practitionersData] = await Promise.all([
        appointmentsRes.json(),
        patientsRes.json(),
        practitionersRes.json()
      ]);

      // Enrich appointments with patient and practitioner names
      const enrichedAppointments = appointmentsData.map((appointment: Appointment) => {
        const patient = patientsData.find((p: any) => p.id === appointment.patientId);
        const practitioner = practitionersData.find((p: any) => p.id === appointment.practitionerId);
        
        return {
          ...appointment,
          patientName: patient ? `${patient.firstName} ${patient.lastName}` : 'Unknown Patient',
          practitionerName: practitioner ? practitioner.name : 'Unknown Practitioner'
        };
      });

      setAppointments(enrichedAppointments);
    } catch (error) {
      console.error('Error fetching appointments:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'confirmed': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      case 'completed': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'confirmed': return <CheckCircle className="h-4 w-4" />;
      case 'pending': return <AlertCircle className="h-4 w-4" />;
      case 'cancelled': return <XCircle className="h-4 w-4" />;
      case 'completed': return <CheckCircle className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  const filteredAppointments = appointments.filter(appointment => {
    if (filter === 'all') return true;
    return appointment.status.toLowerCase() === filter;
  });

  const statusCounts = {
    all: appointments.length,
    confirmed: appointments.filter(a => a.status.toLowerCase() === 'confirmed').length,
    pending: appointments.filter(a => a.status.toLowerCase() === 'pending').length,
    cancelled: appointments.filter(a => a.status.toLowerCase() === 'cancelled').length,
    completed: appointments.filter(a => a.status.toLowerCase() === 'completed').length
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
                <CalendarDays className="h-8 w-8 text-blue-600" />
                All Appointments
              </h1>
              <p className="text-gray-600 mt-1">
                System-wide appointment management and overview
              </p>
            </div>
            <Button>
              <Calendar className="h-4 w-4 mr-2" />
              View Calendar
            </Button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total</p>
                    <p className="text-2xl font-bold text-gray-900">{statusCounts.all}</p>
                  </div>
                  <CalendarDays className="h-8 w-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Confirmed</p>
                    <p className="text-2xl font-bold text-green-600">{statusCounts.confirmed}</p>
                  </div>
                  <CheckCircle className="h-8 w-8 text-green-600" />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Pending</p>
                    <p className="text-2xl font-bold text-yellow-600">{statusCounts.pending}</p>
                  </div>
                  <AlertCircle className="h-8 w-8 text-yellow-600" />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Completed</p>
                    <p className="text-2xl font-bold text-blue-600">{statusCounts.completed}</p>
                  </div>
                  <CheckCircle className="h-8 w-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Cancelled</p>
                    <p className="text-2xl font-bold text-red-600">{statusCounts.cancelled}</p>
                  </div>
                  <XCircle className="h-8 w-8 text-red-600" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Filters */}
          <Card className="mb-6">
            <CardContent className="p-6">
              <div className="flex items-center gap-2">
                <Filter className="h-5 w-5 text-gray-500" />
                <span className="text-sm font-medium text-gray-600">Filter by status:</span>
                <div className="flex gap-2">
                  {['all', 'confirmed', 'pending', 'completed', 'cancelled'].map((status) => (
                    <Button
                      key={status}
                      variant={filter === status ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setFilter(status)}
                      className="capitalize"
                    >
                      {status} ({(statusCounts as any)[status]})
                    </Button>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Appointments List */}
          <Card>
            <CardHeader>
              <CardTitle>Appointments ({filteredAppointments.length})</CardTitle>
              <CardDescription>
                {filter === 'all' ? 'All appointments' : `${filter} appointments`} across the system
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {filteredAppointments.length === 0 ? (
                  <div className="text-center py-8">
                    <CalendarDays className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">No appointments found for the selected filter.</p>
                  </div>
                ) : (
                  filteredAppointments.map((appointment) => (
                    <div key={appointment.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                      <div className="flex items-center gap-4">
                        <div className="flex flex-col items-center">
                          <span className="text-sm font-medium text-gray-900">
                            {format(new Date(appointment.appointmentDate), 'MMM dd')}
                          </span>
                          <span className="text-xs text-gray-500">
                            {appointment.appointmentTime}
                          </span>
                        </div>
                        
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-semibold text-gray-900">{appointment.patientName}</h3>
                            <span className="text-gray-500">with</span>
                            <span className="font-medium text-blue-600">{appointment.practitionerName}</span>
                          </div>
                          
                          <div className="flex items-center gap-4 text-sm text-gray-600">
                            <span>{appointment.reason}</span>
                            <span className="flex items-center gap-1">
                              <Clock className="h-4 w-4" />
                              {appointment.duration} min
                            </span>
                            <span className="capitalize">{appointment.appointmentType}</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-3">
                        <Badge className={`${getStatusColor(appointment.status)} flex items-center gap-1`}>
                          {getStatusIcon(appointment.status)}
                          {appointment.status}
                        </Badge>
                        <Button variant="outline" size="sm">
                          Edit
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}