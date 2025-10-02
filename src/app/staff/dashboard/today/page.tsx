'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { useTodaysAppointments } from '@/hooks/useAppointments';
import { Sidebar } from '@/components/Sidebar';
import { AppointmentCard } from '@/components/AppointmentCard';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  Calendar, 
  Search, 
  Filter, 
  Clock, 
  Users, 
  UserPlus,
  RefreshCw,
  Download,
  CheckCircle,
  XCircle,
  AlertCircle
} from 'lucide-react';
import { format } from 'date-fns';

export default function TodaysAppointments() {
  const { data: session } = useSession();
  const { 
    appointments, 
    loading, 
    error, 
    updateAppointmentStatus, 
    updateAppointmentNotes,
    refetch 
  } = useTodaysAppointments();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [doctorFilter, setDoctorFilter] = useState('all');

  // Filter appointments based on search and filters
  const filteredAppointments = appointments.filter(appointment => {
    const matchesSearch = 
      appointment.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      appointment.reason.toLowerCase().includes(searchTerm.toLowerCase()) ||
      appointment.practitionerName.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || appointment.status === statusFilter;
    const matchesDoctor = doctorFilter === 'all' || appointment.practitionerId === doctorFilter;
    
    return matchesSearch && matchesStatus && matchesDoctor;
  });

  // Get unique doctors for filter
  const uniqueDoctors = Array.from(
    new Set(appointments.map(apt => apt.practitionerId))
  ).map(id => {
    const apt = appointments.find(a => a.practitionerId === id);
    return {
      id,
      name: apt?.practitionerName || 'Unknown Doctor'
    };
  });

  // Statistics
  const stats = {
    total: appointments.length,
    confirmed: appointments.filter(apt => apt.status === 'confirmed').length,
    waiting: appointments.filter(apt => apt.status === 'waiting').length,
    inProgress: appointments.filter(apt => apt.status === 'in-progress').length,
    completed: appointments.filter(apt => apt.status === 'completed').length,
    cancelled: appointments.filter(apt => apt.status === 'cancelled' || apt.status === 'no-show').length
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

  const handleReschedule = (appointmentId: string) => {
    console.log('Reschedule appointment:', appointmentId);
    // Implement reschedule logic
  };

  const handleCancel = (appointmentId: string) => {
    console.log('Cancel appointment:', appointmentId);
    updateAppointmentStatus(appointmentId, 'cancelled');
  };

  const handleNotesUpdate = (appointmentId: string, notes: string) => {
    updateAppointmentNotes(appointmentId, notes);
  };

  if (error) {
    return (
      <div className="min-h-screen flex bg-gray-50">
        <Sidebar />
        <div className="flex-1 p-6">
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-gray-900 mb-2">Failed to load appointments</h2>
              <p className="text-gray-600 mb-4">{error}</p>
              <Button onClick={refetch}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Try Again
              </Button>
            </div>
          </div>
        </div>
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
              <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                <Calendar className="h-6 w-6" />
                Today's Appointments
              </h1>
              <p className="text-gray-600 mt-1">
                {format(new Date(), 'EEEE, MMMM do, yyyy')} • {filteredAppointments.length} of {appointments.length} appointments
              </p>
              {/* Role-based filtering indicator */}
              {session?.user?.role === 'practitioner' && (
                <div className="mt-2">
                  <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                    Showing your appointments only
                  </Badge>
                </div>
              )}
              {(session?.user?.role === 'admin' || session?.user?.role === 'staff' || session?.user?.role === 'nurse') && (
                <div className="mt-2">
                  <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                    Showing all practitioners' appointments
                  </Badge>
                </div>
              )}
            </div>
            <div className="flex items-center gap-3">
              <Button variant="outline" size="sm" onClick={refetch}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
              <Button size="sm">
                <UserPlus className="h-4 w-4 mr-2" />
                New Appointment
              </Button>
            </div>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Quick Stats */}
          <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
                <div className="text-sm text-gray-600">Total</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-blue-600">{stats.confirmed}</div>
                <div className="text-sm text-gray-600">Confirmed</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-yellow-600">{stats.waiting}</div>
                <div className="text-sm text-gray-600">Waiting</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-purple-600">{stats.inProgress}</div>
                <div className="text-sm text-gray-600">In Progress</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-green-600">{stats.completed}</div>
                <div className="text-sm text-gray-600">Completed</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-red-600">{stats.cancelled}</div>
                <div className="text-sm text-gray-600">Cancelled</div>
              </CardContent>
            </Card>
          </div>

          {/* Filters */}
          <Card>
            <CardContent className="p-4">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Search patients, doctors, or reasons..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <div className="flex gap-2">
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-40">
                      <SelectValue placeholder="Filter by status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="confirmed">Confirmed</SelectItem>
                      <SelectItem value="waiting">Waiting</SelectItem>
                      <SelectItem value="in-progress">In Progress</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="cancelled">Cancelled</SelectItem>
                      <SelectItem value="no-show">No Show</SelectItem>
                    </SelectContent>
                  </Select>
                  
                  <Select value={doctorFilter} onValueChange={setDoctorFilter}>
                    <SelectTrigger className="w-40">
                      <SelectValue placeholder="Filter by doctor" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Doctors</SelectItem>
                      {uniqueDoctors.map(doctor => (
                        <SelectItem key={doctor.id} value={doctor.id}>
                          {doctor.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Appointments List */}
          <div className="space-y-4">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            ) : filteredAppointments.length === 0 ? (
              <Card>
                <CardContent className="p-12 text-center">
                  <Calendar className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    {searchTerm || statusFilter !== 'all' || doctorFilter !== 'all' 
                      ? 'No appointments match your filters' 
                      : 'No appointments today'
                    }
                  </h3>
                  <p className="text-gray-600 mb-4">
                    {searchTerm || statusFilter !== 'all' || doctorFilter !== 'all'
                      ? 'Try adjusting your search or filter criteria'
                      : 'Your schedule is clear for today'
                    }
                  </p>
                  {(searchTerm || statusFilter !== 'all' || doctorFilter !== 'all') && (
                    <Button 
                      variant="outline" 
                      onClick={() => {
                        setSearchTerm('');
                        setStatusFilter('all');
                        setDoctorFilter('all');
                      }}
                    >
                      Clear Filters
                    </Button>
                  )}
                </CardContent>
              </Card>
            ) : (
              filteredAppointments
                .sort((a, b) => {
                  // Sort by time
                  const timeA = a.appointmentTime;
                  const timeB = b.appointmentTime;
                  return timeA.localeCompare(timeB);
                })
                .map((appointment) => (
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
                    onReschedule={handleReschedule}
                    onCancel={handleCancel}
                    onContact={handleAppointmentAction}
                    onNotesUpdate={handleNotesUpdate}
                  />
                ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
