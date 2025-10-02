'use client';

import { useState, useCallback, useMemo } from 'react';
import { useSession } from 'next-auth/react';
import { Calendar as BigCalendar, momentLocalizer, Views, View } from 'react-big-calendar';
import moment from 'moment';
import { useAppointments } from '@/hooks/useAppointments';
import { Sidebar } from '@/components/Sidebar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { 
  Calendar as CalendarIcon, 
  Plus, 
  ChevronLeft, 
  ChevronRight,
  Users,
  Clock,
  MapPin,
  Phone,
  MessageSquare
} from 'lucide-react';
import { format } from 'date-fns';

// Import calendar CSS
import 'react-big-calendar/lib/css/react-big-calendar.css';

const localizer = momentLocalizer(moment);

// Custom event component
const EventComponent = ({ event }: { event: any }) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'bg-blue-500';
      case 'waiting': return 'bg-yellow-500';
      case 'in-progress': return 'bg-purple-500';
      case 'completed': return 'bg-green-500';
      case 'cancelled': return 'bg-red-500';
      case 'no-show': return 'bg-gray-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div className={`text-white text-xs p-1 rounded ${getStatusColor(event.status)}`}>
      <div className="font-medium truncate">{event.title}</div>
      <div className="truncate">{event.doctor}</div>
    </div>
  );
};

// Custom toolbar component
const CustomToolbar = ({ label, onNavigate, onView, view }: any) => {
  return (
    <div className="flex items-center justify-between mb-4 p-4 bg-white rounded-lg border">
      <div className="flex items-center gap-2">
        <Button variant="outline" size="sm" onClick={() => onNavigate('PREV')}>
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <Button variant="outline" size="sm" onClick={() => onNavigate('TODAY')}>
          Today
        </Button>
        <Button variant="outline" size="sm" onClick={() => onNavigate('NEXT')}>
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
      
      <h2 className="text-xl font-semibold text-gray-900">{label}</h2>
      
      <div className="flex items-center gap-2">
        <Button 
          variant={view === Views.DAY ? 'default' : 'outline'} 
          size="sm" 
          onClick={() => onView(Views.DAY)}
        >
          Day
        </Button>
        <Button 
          variant={view === Views.WEEK ? 'default' : 'outline'} 
          size="sm" 
          onClick={() => onView(Views.WEEK)}
        >
          Week
        </Button>
        <Button 
          variant={view === Views.MONTH ? 'default' : 'outline'} 
          size="sm" 
          onClick={() => onView(Views.MONTH)}
        >
          Month
        </Button>
      </div>
    </div>
  );
};

export default function CalendarPage() {
  const { data: session } = useSession();
  const { appointments, practitioners, loading, error } = useAppointments();
  const [view, setView] = useState<View>(Views.WEEK);
  const [date, setDate] = useState(new Date());
  const [selectedEvent, setSelectedEvent] = useState<any>(null);
  const [showEventDialog, setShowEventDialog] = useState(false);

  // Convert appointments to calendar events
  const events = useMemo(() => {
    return appointments.map(appointment => {
      const appointmentDate = new Date(appointment.appointmentDate);
      const [time, period] = appointment.appointmentTime.split(' ');
      const [hours, minutes] = time.split(':').map(Number);
      
      // Convert to 24-hour format
      let hour24 = hours;
      if (period?.toLowerCase() === 'pm' && hours !== 12) hour24 += 12;
      if (period?.toLowerCase() === 'am' && hours === 12) hour24 = 0;
      
      const startTime = new Date(appointmentDate);
      startTime.setHours(hour24, minutes || 0, 0, 0);
      
      const endTime = new Date(startTime);
      endTime.setMinutes(endTime.getMinutes() + appointment.duration);

      return {
        id: appointment.id,
        title: appointment.patientName,
        start: startTime,
        end: endTime,
        resource: {
          ...appointment,
          doctor: appointment.practitionerName,
          patientPhone: appointment.patientPhone
        },
        status: appointment.status
      };
    });
  }, [appointments]);

  const handleSelectEvent = useCallback((event: any) => {
    setSelectedEvent(event);
    setShowEventDialog(true);
  }, []);

  const handleSelectSlot = useCallback(({ start, end }: { start: Date; end: Date }) => {
    console.log('Selected slot:', { start, end });
    // Implement new appointment creation
  }, []);

  const handleNavigate = useCallback((newDate: Date) => {
    setDate(newDate);
  }, []);

  const handleViewChange = useCallback((newView: View) => {
    setView(newView);
  }, []);

  // Calendar styling
  const calendarStyle = {
    height: 'calc(100vh - 200px)',
    backgroundColor: 'white',
    borderRadius: '8px',
    padding: '16px'
  };

  const eventStyleGetter = (event: any) => {
    const getStatusColor = (status: string) => {
      switch (status) {
        case 'confirmed': return '#3b82f6';
        case 'waiting': return '#f59e0b';
        case 'in-progress': return '#8b5cf6';
        case 'completed': return '#10b981';
        case 'cancelled': return '#ef4444';
        case 'no-show': return '#6b7280';
        default: return '#6b7280';
      }
    };

    return {
      style: {
        backgroundColor: getStatusColor(event.status),
        borderRadius: '4px',
        opacity: 0.8,
        color: 'white',
        border: '0px',
        display: 'block'
      }
    };
  };

  if (loading) {
    return (
      <div className="min-h-screen flex bg-gray-50">
        <Sidebar />
        <div className="flex-1 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex bg-gray-50">
        <Sidebar />
        <div className="flex-1 p-6">
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <CalendarIcon className="h-16 w-16 text-red-500 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-gray-900 mb-2">Failed to load calendar</h2>
              <p className="text-gray-600">{error}</p>
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
                <CalendarIcon className="h-6 w-6" />
                Calendar
              </h1>
              <p className="text-gray-600 mt-1">
                Schedule management and appointment overview
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
              <Button variant="outline" size="sm">
                <Users className="h-4 w-4 mr-2" />
                Practitioners
              </Button>
              <Button size="sm">
                <Plus className="h-4 w-4 mr-2" />
                New Appointment
              </Button>
            </div>
          </div>
        </div>

        <div className="p-6">
          {/* Legend */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="text-base">Appointment Status Legend</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-4">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-blue-500 rounded"></div>
                  <span className="text-sm">Confirmed</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-yellow-500 rounded"></div>
                  <span className="text-sm">Waiting</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-purple-500 rounded"></div>
                  <span className="text-sm">In Progress</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-green-500 rounded"></div>
                  <span className="text-sm">Completed</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-red-500 rounded"></div>
                  <span className="text-sm">Cancelled</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-gray-500 rounded"></div>
                  <span className="text-sm">No Show</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Calendar */}
          <div style={calendarStyle}>
            <BigCalendar
              localizer={localizer}
              events={events}
              view={view}
              date={date}
              onView={handleViewChange}
              onNavigate={handleNavigate}
              onSelectEvent={handleSelectEvent}
              onSelectSlot={handleSelectSlot}
              selectable
              components={{
                toolbar: CustomToolbar,
                event: EventComponent
              }}
              eventPropGetter={eventStyleGetter}
              step={15}
              timeslots={4}
              min={new Date(0, 0, 0, 7, 0, 0)} // 7 AM
              max={new Date(0, 0, 0, 19, 0, 0)} // 7 PM
              formats={{
                timeGutterFormat: 'HH:mm',
                eventTimeRangeFormat: ({ start, end }) => 
                  `${moment(start).format('HH:mm')} - ${moment(end).format('HH:mm')}`
              }}
            />
          </div>
        </div>
      </div>

      {/* Event Details Dialog */}
      <Dialog open={showEventDialog} onOpenChange={setShowEventDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Appointment Details</DialogTitle>
            <DialogDescription>
              {selectedEvent && format(selectedEvent.start, 'EEEE, MMMM do, yyyy')}
            </DialogDescription>
          </DialogHeader>
          {selectedEvent && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-lg">{selectedEvent.title}</h3>
                <Badge className={`${
                  selectedEvent.status === 'confirmed' ? 'bg-blue-100 text-blue-800' :
                  selectedEvent.status === 'waiting' ? 'bg-yellow-100 text-yellow-800' :
                  selectedEvent.status === 'in-progress' ? 'bg-purple-100 text-purple-800' :
                  selectedEvent.status === 'completed' ? 'bg-green-100 text-green-800' :
                  selectedEvent.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {selectedEvent.status}
                </Badge>
              </div>
              
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-gray-500" />
                  <span>
                    {moment(selectedEvent.start).format('h:mm A')} - {moment(selectedEvent.end).format('h:mm A')}
                    ({selectedEvent.resource.duration} minutes)
                  </span>
                </div>
                
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-gray-500" />
                  <span>{selectedEvent.resource.doctor}</span>
                </div>
                
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-gray-500" />
                  <span>{selectedEvent.resource.appointmentType}</span>
                </div>
                
                {selectedEvent.resource.reason && (
                  <div className="flex items-start gap-2">
                    <MessageSquare className="h-4 w-4 text-gray-500 mt-0.5" />
                    <span>{selectedEvent.resource.reason}</span>
                  </div>
                )}
              </div>

              <div className="flex gap-2 pt-4">
                <Button size="sm" className="flex-1">
                  Edit
                </Button>
                {selectedEvent.resource.patientPhone && (
                  <Button variant="outline" size="sm">
                    <Phone className="h-4 w-4" />
                  </Button>
                )}
                <Button variant="outline" size="sm">
                  <MessageSquare className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
