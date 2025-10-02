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
  Calendar as CalendarIcon, 
  ChevronLeft, 
  ChevronRight,
  Plus,
  Clock,
  Users,
  MapPin
} from 'lucide-react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, isSameMonth, addMonths, subMonths } from 'date-fns';

interface Appointment {
  id: string;
  patientId: string;
  practitionerId: string;
  appointmentDate: string;
  appointmentTime: string;
  duration: number;
  status: string;
  patientName?: string;
  practitionerName?: string;
  reason: string;
}

export default function AdminCalendar() {
  const { data: session, status } = useSession();
  const { user } = useAuth();
  const router = useRouter();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

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

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const calendarDays = eachDayOfInterval({ start: monthStart, end: monthEnd });

  const getAppointmentsForDate = (date: Date) => {
    return appointments.filter(appointment => 
      isSameDay(new Date(appointment.appointmentDate), date)
    );
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'confirmed': return 'bg-green-500';
      case 'pending': return 'bg-yellow-500';
      case 'cancelled': return 'bg-red-500';
      case 'completed': return 'bg-blue-500';
      default: return 'bg-gray-500';
    }
  };

  const selectedDateAppointments = selectedDate ? getAppointmentsForDate(selectedDate) : [];

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
                <CalendarIcon className="h-8 w-8 text-blue-600" />
                Master Calendar
              </h1>
              <p className="text-gray-600 mt-1">
                Clinic-wide schedule and appointment overview
              </p>
            </div>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              New Appointment
            </Button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Calendar */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      {format(currentDate, 'MMMM yyyy')}
                    </CardTitle>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentDate(subMonths(currentDate, 1))}
                      >
                        <ChevronLeft className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentDate(new Date())}
                      >
                        Today
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentDate(addMonths(currentDate, 1))}
                      >
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {/* Calendar Grid */}
                  <div className="grid grid-cols-7 gap-1 mb-4">
                    {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                      <div key={day} className="p-2 text-center text-sm font-medium text-gray-500">
                        {day}
                      </div>
                    ))}
                  </div>
                  
                  <div className="grid grid-cols-7 gap-1">
                    {calendarDays.map(day => {
                      const dayAppointments = getAppointmentsForDate(day);
                      const isSelected = selectedDate && isSameDay(day, selectedDate);
                      const isToday = isSameDay(day, new Date());
                      
                      return (
                        <div
                          key={day.toISOString()}
                          className={`
                            min-h-[100px] p-2 border rounded-lg cursor-pointer transition-colors
                            ${isSelected ? 'bg-blue-50 border-blue-300' : 'hover:bg-gray-50'}
                            ${!isSameMonth(day, currentDate) ? 'text-gray-400 bg-gray-50' : ''}
                            ${isToday ? 'border-blue-500 bg-blue-50' : ''}
                          `}
                          onClick={() => setSelectedDate(day)}
                        >
                          <div className={`text-sm font-medium mb-1 ${isToday ? 'text-blue-600' : ''}`}>
                            {format(day, 'd')}
                          </div>
                          <div className="space-y-1">
                            {dayAppointments.slice(0, 3).map(appointment => (
                              <div
                                key={appointment.id}
                                className={`
                                  text-xs p-1 rounded text-white truncate
                                  ${getStatusColor(appointment.status)}
                                `}
                                title={`${appointment.appointmentTime} - ${appointment.patientName} with ${appointment.practitionerName}`}
                              >
                                {appointment.appointmentTime} {appointment.patientName}
                              </div>
                            ))}
                            {dayAppointments.length > 3 && (
                              <div className="text-xs text-gray-500">
                                +{dayAppointments.length - 3} more
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Side Panel */}
            <div className="space-y-6">
              {/* Quick Stats */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Today's Overview</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Total Appointments</span>
                    <span className="font-semibold">{getAppointmentsForDate(new Date()).length}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Confirmed</span>
                    <span className="font-semibold text-green-600">
                      {getAppointmentsForDate(new Date()).filter(a => a.status === 'confirmed').length}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Pending</span>
                    <span className="font-semibold text-yellow-600">
                      {getAppointmentsForDate(new Date()).filter(a => a.status === 'pending').length}
                    </span>
                  </div>
                </CardContent>
              </Card>

              {/* Selected Date Details */}
              {selectedDate && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">
                      {format(selectedDate, 'EEEE, MMMM d, yyyy')}
                    </CardTitle>
                    <CardDescription>
                      {selectedDateAppointments.length} appointment(s)
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {selectedDateAppointments.length === 0 ? (
                      <p className="text-gray-500 text-sm">No appointments scheduled</p>
                    ) : (
                      <div className="space-y-3">
                        {selectedDateAppointments.map(appointment => (
                          <div key={appointment.id} className="border-l-4 border-blue-500 pl-3 py-2">
                            <div className="flex items-center justify-between mb-1">
                              <span className="font-medium text-sm">{appointment.appointmentTime}</span>
                              <Badge className={`text-xs ${getStatusColor(appointment.status)} text-white`}>
                                {appointment.status}
                              </Badge>
                            </div>
                            <p className="text-sm text-gray-900">{appointment.patientName}</p>
                            <p className="text-xs text-gray-600">{appointment.practitionerName}</p>
                            <p className="text-xs text-gray-500">{appointment.reason}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* Legend */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Status Legend</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-green-500 rounded"></div>
                    <span className="text-sm">Confirmed</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-yellow-500 rounded"></div>
                    <span className="text-sm">Pending</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-blue-500 rounded"></div>
                    <span className="text-sm">Completed</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-red-500 rounded"></div>
                    <span className="text-sm">Cancelled</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}