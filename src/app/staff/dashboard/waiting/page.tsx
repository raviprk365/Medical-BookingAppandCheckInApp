'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useWaitingList } from '@/hooks/useAppointments';
import { Sidebar } from '@/components/Sidebar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Clock, 
  Users, 
  Play, 
  Pause, 
  CheckCircle, 
  XCircle, 
  Phone, 
  MessageSquare,
  Timer,
  AlertTriangle,
  RefreshCw,
  UserCheck,
  UserX
} from 'lucide-react';
import { format, differenceInMinutes } from 'date-fns';

interface WaitingPatient {
  id: string;
  patientName: string;
  appointmentTime: string;
  checkInTime?: string;
  waitingDuration: number;
  doctor: string;
  appointmentType: string;
  status: 'waiting' | 'in-progress';
  urgency: 'routine' | 'urgent' | 'emergency';
  phone?: string;
  notes?: string;
}

export default function WaitingPage() {
  const { data: session } = useSession();
  const { 
    waitingAppointments, 
    loading, 
    error, 
    updateAppointmentStatus, 
    refetch 
  } = useWaitingList();
  
  const [currentTime, setCurrentTime] = useState(new Date());

  // Update current time every minute
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);
    
    return () => clearInterval(timer);
  }, []);

  // Calculate waiting duration for each patient
  const waitingPatients: WaitingPatient[] = waitingAppointments.map(appointment => {
    const appointmentDateTime = new Date(`${appointment.appointmentDate} ${appointment.appointmentTime}`);
    // Use appointment time as check-in time since checkInTime property doesn't exist
    const checkInTime = new Date(appointment.createdAt);
    const waitingDuration = differenceInMinutes(currentTime, checkInTime);

    return {
      id: appointment.id,
      patientName: appointment.patientName,
      appointmentTime: appointment.appointmentTime,
      checkInTime: appointment.createdAt, // Using createdAt as a proxy for check-in time
      waitingDuration: Math.max(0, waitingDuration),
      doctor: appointment.practitionerName,
      appointmentType: appointment.appointmentType,
      status: appointment.status as 'waiting' | 'in-progress',
      urgency: (appointment.urgency as 'routine' | 'urgent' | 'emergency') || 'routine',
      phone: appointment.patientPhone,
      notes: appointment.notes
    };
  });

  // Sort by urgency and waiting time
  const sortedPatients = waitingPatients.sort((a, b) => {
    // First sort by urgency
    const urgencyOrder = { emergency: 0, urgent: 1, routine: 2 };
    const urgencyDiff = urgencyOrder[a.urgency] - urgencyOrder[b.urgency];
    if (urgencyDiff !== 0) return urgencyDiff;
    
    // Then by waiting duration (longest first)
    return b.waitingDuration - a.waitingDuration;
  });

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'emergency': return 'bg-red-100 text-red-800';
      case 'urgent': return 'bg-orange-100 text-orange-800';
      case 'routine': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getWaitingTimeColor = (minutes: number) => {
    if (minutes > 30) return 'text-red-600';
    if (minutes > 15) return 'text-orange-600';
    return 'text-green-600';
  };

  const handleStartConsultation = (patientId: string) => {
    updateAppointmentStatus(patientId, 'in-progress');
  };

  const handleCompleteConsultation = (patientId: string) => {
    updateAppointmentStatus(patientId, 'completed');
  };

  const handleMarkNoShow = (patientId: string) => {
    updateAppointmentStatus(patientId, 'no-show');
  };

  const handleContact = (patientId: string, method: 'call' | 'message') => {
    console.log(`${method} patient:`, patientId);
    // Implement contact functionality
  };

  const stats = {
    totalWaiting: waitingPatients.filter(p => p.status === 'waiting').length,
    inProgress: waitingPatients.filter(p => p.status === 'in-progress').length,
    averageWaitTime: waitingPatients.length > 0 
      ? Math.round(waitingPatients.reduce((sum, p) => sum + p.waitingDuration, 0) / waitingPatients.length)
      : 0,
    longestWait: waitingPatients.length > 0 
      ? Math.max(...waitingPatients.map(p => p.waitingDuration))
      : 0
  };

  if (error) {
    return (
      <div className="min-h-screen flex bg-gray-50">
        <Sidebar />
        <div className="flex-1 p-6">
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <AlertTriangle className="h-16 w-16 text-red-500 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-gray-900 mb-2">Failed to load waiting list</h2>
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
                <Clock className="h-6 w-6" />
                Waiting List
              </h1>
              <p className="text-gray-600 mt-1">
                Queue management • Last updated: {format(currentTime, 'h:mm a')}
              </p>
              {/* Role-based filtering indicator */}
              {session?.user?.role === 'practitioner' && (
                <div className="mt-2">
                  <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                    Showing your waiting patients only
                  </Badge>
                </div>
              )}
              {(session?.user?.role === 'admin' || session?.user?.role === 'staff' || session?.user?.role === 'nurse') && (
                <div className="mt-2">
                  <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                    Showing all practitioners' waiting patients
                  </Badge>
                </div>
              )}
            </div>
            <div className="flex items-center gap-3">
              <Button variant="outline" size="sm" onClick={refetch}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
              <div className="text-sm text-gray-500">
                Auto-refresh in 60s
              </div>
            </div>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 font-medium">Patients Waiting</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.totalWaiting}</p>
                  </div>
                  <Users className="h-8 w-8 text-yellow-600" />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 font-medium">In Progress</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.inProgress}</p>
                  </div>
                  <Play className="h-8 w-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 font-medium">Average Wait</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.averageWaitTime}m</p>
                  </div>
                  <Timer className="h-8 w-8 text-green-600" />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 font-medium">Longest Wait</p>
                    <p className={`text-2xl font-bold ${getWaitingTimeColor(stats.longestWait)}`}>
                      {stats.longestWait}m
                    </p>
                  </div>
                  <Clock className="h-8 w-8 text-red-600" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Waiting List */}
          <Card>
            <CardHeader>
              <CardTitle>Current Queue</CardTitle>
              <CardDescription>
                Patients currently waiting or in consultation
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
              ) : sortedPatients.length === 0 ? (
                <div className="text-center py-12">
                  <Users className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">No patients waiting</h3>
                  <p className="text-gray-600">All patients have been seen or no appointments are checked in</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {sortedPatients.map((patient, index) => (
                    <div key={patient.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          {/* Queue Position */}
                          <div className="flex items-center justify-center w-8 h-8 bg-blue-100 text-blue-800 rounded-full font-bold text-sm">
                            {index + 1}
                          </div>
                          
                          {/* Patient Info */}
                          <div className="flex items-center gap-3">
                            <Avatar>
                              <AvatarFallback>
                                {patient.patientName.split(' ').map(n => n[0]).join('')}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="flex items-center gap-2 mb-1">
                                <h3 className="font-semibold text-gray-900">{patient.patientName}</h3>
                                <Badge className={getUrgencyColor(patient.urgency)}>
                                  {patient.urgency}
                                </Badge>
                                <Badge variant={patient.status === 'waiting' ? 'secondary' : 'default'}>
                                  {patient.status === 'waiting' ? 'Waiting' : 'In Progress'}
                                </Badge>
                              </div>
                              <div className="flex items-center gap-4 text-sm text-gray-600">
                                <span>Appt: {patient.appointmentTime}</span>
                                <span>Type: {patient.appointmentType}</span>
                                <span>Doctor: {patient.doctor}</span>
                              </div>
                              {patient.notes && (
                                <p className="text-xs text-gray-500 mt-1 italic">
                                  Note: {patient.notes}
                                </p>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Waiting Time & Actions */}
                        <div className="flex items-center gap-4">
                          {/* Waiting Time */}
                          <div className="text-center">
                            <div className={`text-2xl font-bold ${getWaitingTimeColor(patient.waitingDuration)}`}>
                              {patient.waitingDuration}m
                            </div>
                            <div className="text-xs text-gray-500">waiting</div>
                          </div>

                          {/* Action Buttons */}
                          <div className="flex items-center gap-2">
                            {patient.status === 'waiting' && (
                              <Button
                                size="sm"
                                onClick={() => handleStartConsultation(patient.id)}
                                className="bg-green-600 hover:bg-green-700"
                              >
                                <Play className="h-4 w-4 mr-1" />
                                Start
                              </Button>
                            )}
                            
                            {patient.status === 'in-progress' && (
                              <Button
                                size="sm"
                                onClick={() => handleCompleteConsultation(patient.id)}
                                className="bg-blue-600 hover:bg-blue-700"
                              >
                                <CheckCircle className="h-4 w-4 mr-1" />
                                Complete
                              </Button>
                            )}

                            {patient.phone && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleContact(patient.id, 'call')}
                              >
                                <Phone className="h-4 w-4" />
                              </Button>
                            )}

                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleContact(patient.id, 'message')}
                            >
                              <MessageSquare className="h-4 w-4" />
                            </Button>

                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleMarkNoShow(patient.id)}
                              className="text-red-600 hover:text-red-700"
                            >
                              <UserX className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="cursor-pointer hover:shadow-md transition-shadow">
              <CardContent className="p-6 text-center">
                <UserCheck className="h-12 w-12 text-blue-600 mx-auto mb-3" />
                <h3 className="font-semibold text-gray-900 mb-2">Check In Patient</h3>
                <p className="text-sm text-gray-600">Manually check in a patient who has arrived</p>
              </CardContent>
            </Card>

            <Card className="cursor-pointer hover:shadow-md transition-shadow">
              <CardContent className="p-6 text-center">
                <MessageSquare className="h-12 w-12 text-green-600 mx-auto mb-3" />
                <h3 className="font-semibold text-gray-900 mb-2">Send Updates</h3>
                <p className="text-sm text-gray-600">Notify patients about wait times or delays</p>
              </CardContent>
            </Card>

            <Card className="cursor-pointer hover:shadow-md transition-shadow">
              <CardContent className="p-6 text-center">
                <Timer className="h-12 w-12 text-orange-600 mx-auto mb-3" />
                <h3 className="font-semibold text-gray-900 mb-2">Manage Flow</h3>
                <p className="text-sm text-gray-600">Optimize patient flow and reduce wait times</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
