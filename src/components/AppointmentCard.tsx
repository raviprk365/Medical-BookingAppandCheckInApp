'use client';

import { cn } from '@/lib/utils';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Clock, 
  User, 
  Phone, 
  MessageSquare, 
  MoreVertical,
  CheckCircle,
  XCircle,
  Edit3
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface AppointmentCardProps {
  appointment: {
    id: string;
    patientName: string;
    time: string;
    duration: number;
    type: string;
    doctor: string;
    status: 'confirmed' | 'waiting' | 'in-progress' | 'completed' | 'cancelled' | 'no-show';
    reason?: string;
    phone?: string;
    notes?: string;
  };
  onStatusChange?: (appointmentId: string, status: string) => void;
  onReschedule?: (appointmentId: string) => void;
  onCancel?: (appointmentId: string) => void;
  onContact?: (appointmentId: string, method: 'call' | 'message') => void;
  className?: string;
}

const statusConfig = {
  confirmed: { 
    label: 'Confirmed', 
    color: 'bg-green-100 text-green-800',
    icon: CheckCircle
  },
  waiting: { 
    label: 'Waiting', 
    color: 'bg-yellow-100 text-yellow-800',
    icon: Clock
  },
  'in-progress': { 
    label: 'In Progress', 
    color: 'bg-blue-100 text-blue-800',
    icon: User
  },
  completed: { 
    label: 'Completed', 
    color: 'bg-green-100 text-green-800',
    icon: CheckCircle
  },
  cancelled: { 
    label: 'Cancelled', 
    color: 'bg-red-100 text-red-800',
    icon: XCircle
  },
  'no-show': { 
    label: 'No Show', 
    color: 'bg-red-100 text-red-800',
    icon: XCircle
  }
};

export function AppointmentCard({ 
  appointment, 
  onStatusChange,
  onReschedule,
  onCancel,
  onContact,
  className 
}: AppointmentCardProps) {
  const status = statusConfig[appointment.status];
  const StatusIcon = status.icon;

  return (
    <Card className={cn('hover:shadow-md transition-shadow', className)}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            {/* Header */}
            <div className="flex items-center gap-2 mb-2">
              <h3 className="font-semibold text-gray-900">{appointment.patientName}</h3>
              <Badge className={status.color}>
                <StatusIcon className="h-3 w-3 mr-1" />
                {status.label}
              </Badge>
            </div>

            {/* Details */}
            <div className="space-y-1 text-sm text-gray-600">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  <span>{appointment.time} ({appointment.duration} min)</span>
                </div>
                <div className="flex items-center gap-1">
                  <User className="h-4 w-4" />
                  <span>{appointment.doctor}</span>
                </div>
              </div>
              
              <div>
                <span className="font-medium">{appointment.type}</span>
                {appointment.reason && (
                  <span className="text-gray-500"> • {appointment.reason}</span>
                )}
              </div>

              {appointment.notes && (
                <p className="text-xs text-gray-500 italic mt-2">
                  Note: {appointment.notes}
                </p>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            {/* Quick Actions */}
            {appointment.status === 'waiting' && (
              <Button 
                size="sm"
                onClick={() => onStatusChange?.(appointment.id, 'in-progress')}
              >
                Start
              </Button>
            )}
            
            {appointment.status === 'in-progress' && (
              <Button 
                size="sm" 
                variant="outline"
                onClick={() => onStatusChange?.(appointment.id, 'completed')}
              >
                Complete
              </Button>
            )}

            {/* Contact Buttons */}
            {appointment.phone && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => onContact?.(appointment.id, 'call')}
              >
                <Phone className="h-4 w-4" />
              </Button>
            )}

            <Button
              size="sm"
              variant="outline"
              onClick={() => onContact?.(appointment.id, 'message')}
            >
              <MessageSquare className="h-4 w-4" />
            </Button>

            {/* More Actions */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => onReschedule?.(appointment.id)}>
                  <Edit3 className="h-4 w-4 mr-2" />
                  Reschedule
                </DropdownMenuItem>
                
                {appointment.status === 'confirmed' && (
                  <DropdownMenuItem 
                    onClick={() => onStatusChange?.(appointment.id, 'waiting')}
                  >
                    <Clock className="h-4 w-4 mr-2" />
                    Mark as Waiting
                  </DropdownMenuItem>
                )}
                
                {appointment.status !== 'cancelled' && (
                  <DropdownMenuItem 
                    onClick={() => onCancel?.(appointment.id)}
                    className="text-red-600"
                  >
                    <XCircle className="h-4 w-4 mr-2" />
                    Cancel
                  </DropdownMenuItem>
                )}

                {appointment.status === 'waiting' && (
                  <DropdownMenuItem 
                    onClick={() => onStatusChange?.(appointment.id, 'no-show')}
                    className="text-red-600"
                  >
                    <XCircle className="h-4 w-4 mr-2" />
                    Mark No Show
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
