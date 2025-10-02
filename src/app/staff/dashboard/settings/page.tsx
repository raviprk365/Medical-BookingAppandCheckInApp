'use client';

import { useState, useEffect } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { Sidebar } from '@/components/Sidebar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { 
  Settings as SettingsIcon, 
  Calendar, 
  Clock, 
  Plus, 
  Trash2, 
  Copy, 
  Save,
  UserCog,
  Bell,
  Shield,
  Palette,
  Globe,
  Loader2
} from 'lucide-react';

// Type definitions
type DayOfWeek = 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday';

interface Session {
  start: string;
  end: string;
}

interface DayAvailability {
  enabled: boolean;
  sessions: Session[];
}

type AvailabilityData = Record<DayOfWeek, DayAvailability>;

interface Break {
  id: string;
  name: string;
  start: string;
  end: string;
  days: DayOfWeek[];
  date?: string; // Optional: for date-specific breaks
}

interface Exception {
  id: string;
  date: string;
  type: 'unavailable' | 'special_hours' | 'meeting' | 'break';
  name?: string;
  reason?: string;
  sessions?: Session[];
  startTime?: string;
  endTime?: string;
}

// Sample availability data
const defaultAvailability: AvailabilityData = {
  monday: { enabled: true, sessions: [{ start: '09:00', end: '17:00' }] },
  tuesday: { enabled: true, sessions: [{ start: '09:00', end: '17:00' }] },
  wednesday: { enabled: true, sessions: [{ start: '09:00', end: '17:00' }] },
  thursday: { enabled: true, sessions: [{ start: '09:00', end: '17:00' }] },
  friday: { enabled: true, sessions: [{ start: '09:00', end: '17:00' }] },
  saturday: { enabled: false, sessions: [] },
  sunday: { enabled: false, sessions: [] }
};

const defaultBreaks: Break[] = [
  { id: '1', name: 'Lunch Break', start: '12:00', end: '13:00', days: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'] },
  { id: '2', name: 'Coffee Break', start: '15:00', end: '15:15', days: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'] }
];

const timeOptions = Array.from({ length: 48 }, (_, i) => {
  const hour = Math.floor(i / 2);
  const minute = (i % 2) * 30;
  const time = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
  return time;
});

export default function SettingsPage() {
  const { data: session } = useSession();
  const [availability, setAvailability] = useState<AvailabilityData>(defaultAvailability);
  const [breaks, setBreaks] = useState<Break[]>(defaultBreaks);
  const [exceptions, setExceptions] = useState<Exception[]>([]);
  const [showBreakDialog, setShowBreakDialog] = useState(false);
  const [showExceptionDialog, setShowExceptionDialog] = useState(false);
  const [newBreak, setNewBreak] = useState<Omit<Break, 'id'>>({ name: '', start: '', end: '', days: [] });
  const [newException, setNewException] = useState<Omit<Exception, 'id'>>({ 
    date: '', 
    type: 'meeting', 
    name: '', 
    reason: '', 
    startTime: '', 
    endTime: '' 
  });
  const [isSaving, setIsSaving] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState<'success' | 'error'>('success');
  const [isLoading, setIsLoading] = useState(true);

  // Load existing settings from database
  useEffect(() => {
    const loadSettings = async () => {
      if (!session?.user) return;
      
      setIsLoading(true);
      try {
        const practitionerId = (session.user as any)?.practitionerId || 'prac-1';
        console.log('📖 Loading settings for practitioner:', practitionerId);
        
        const response = await fetch(`/api/practitioners/${practitionerId}/settings`);
        
        if (response.ok) {
          const result = await response.json();
          console.log('✅ Settings loaded from database:', result.data);
          
          if (result.data.availability) {
            setAvailability(result.data.availability);
          }
          if (result.data.breaks) {
            setBreaks(result.data.breaks);
          }
          if (result.data.exceptions) {
            setExceptions(result.data.exceptions);
          }
        } else {
          console.log('⚠️ No existing settings found, using defaults');
        }
      } catch (error) {
        console.error('❌ Error loading settings:', error);
        // Continue with default settings
      } finally {
        setIsLoading(false);
      }
    };

    loadSettings();
  }, [session]);

  const dayNames: Record<DayOfWeek, string> = {
    monday: 'Monday',
    tuesday: 'Tuesday',
    wednesday: 'Wednesday',
    thursday: 'Thursday',
    friday: 'Friday',
    saturday: 'Saturday',
    sunday: 'Sunday'
  };

  const handleDayToggle = (day: DayOfWeek, enabled: boolean) => {
    setAvailability(prev => ({
      ...prev,
      [day]: {
        ...prev[day],
        enabled,
        sessions: enabled ? ((prev[day]?.sessions?.length || 0) === 0 ? [{ start: '09:00', end: '17:00' }] : prev[day]?.sessions || []) : []
      }
    }));
  };

  const handleSessionUpdate = (day: DayOfWeek, sessionIndex: number, field: 'start' | 'end', value: string) => {
    setAvailability(prev => ({
      ...prev,
      [day]: {
        ...prev[day],
        sessions: (prev[day]?.sessions || []).map((session, index) =>
          index === sessionIndex ? { ...session, [field]: value } : session
        )
      }
    }));
  };

  const addSession = (day: DayOfWeek) => {
    setAvailability(prev => ({
      ...prev,
      [day]: {
        ...prev[day],
        sessions: [...(prev[day]?.sessions || []), { start: '09:00', end: '17:00' }]
      }
    }));
  };

  const removeSession = (day: DayOfWeek, sessionIndex: number) => {
    setAvailability(prev => ({
      ...prev,
      [day]: {
        ...prev[day],
        sessions: (prev[day]?.sessions || []).filter((_, index) => index !== sessionIndex)
      }
    }));
  };

  const copyWeek = () => {
    // Copy current week to next weeks
    console.log('Copy week schedule');
  };

  const addBreak = () => {
    if (newBreak.name && newBreak.start && newBreak.end && newBreak.days.length > 0) {
      setBreaks(prev => [...prev, { ...newBreak, id: Date.now().toString() }]);
      setNewBreak({ name: '', start: '', end: '', days: [] });
      setShowBreakDialog(false);
    }
  };

  const removeBreak = (breakId: string) => {
    setBreaks(prev => prev.filter(b => b.id !== breakId));
  };

  // Exception handlers
  const addException = () => {
    if (newException.date && newException.name) {
      const exception: Exception = {
        ...newException,
        id: Date.now().toString()
      };
      setExceptions(prev => [...prev, exception]);
      setNewException({ 
        date: '', 
        type: 'meeting', 
        name: '', 
        reason: '', 
        startTime: '', 
        endTime: '' 
      });
      setShowExceptionDialog(false);
      showToastMessage(`${newException.type === 'meeting' ? 'Meeting' : 'Exception'} added successfully!`);
    }
  };

  const removeException = (exceptionId: string) => {
    setExceptions(prev => prev.filter(e => e.id !== exceptionId));
    showToastMessage('Exception removed successfully!');
  };

  // Save functionality with loading and toast
  const showToastMessage = (message: string, type: 'success' | 'error' = 'success') => {
    setToastMessage(message);
    setToastType(type);
    setShowToast(true);
    // Auto-hide toast after 3 seconds
    setTimeout(() => setShowToast(false), 3000);
  };

  const saveSettings = async () => {
    setIsSaving(true);
    try {
      // Get the practitioner ID from session
      const practitionerId = (session?.user as any)?.practitionerId || 'prac-1';
      
      console.log('🔄 Saving settings for practitioner:', practitionerId);
      
      const response = await fetch(`/api/practitioners/${practitionerId}/settings`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          availability,
          breaks,
          exceptions
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to save settings');
      }

      const result = await response.json();
      console.log('✅ Settings saved to database:', result);
      showToastMessage('Settings saved successfully to database!', 'success');
    } catch (error) {
      console.error('❌ Error saving settings:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to save settings';
      showToastMessage(`Failed to save settings: ${errorMessage}`, 'error');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex bg-gray-50">
        <Sidebar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
            <p className="text-gray-600">Loading settings...</p>
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
                <SettingsIcon className="h-6 w-6" />
                Settings
              </h1>
              <p className="text-gray-600 mt-1">
                Manage your availability, preferences, and system settings
              </p>
              {session && (
                <div className="mt-2 text-xs text-gray-500">
                  Debug: User ID: {session.user.id} | Role: {session.user.role} | PractitionerId: {(session.user as any).practitionerId || 'undefined'}
                </div>
              )}
            </div>
            <div className="flex items-center gap-3">
              <Button variant="outline" onClick={() => signOut()}>
                Logout & Refresh Session
              </Button>
              <Button variant="outline" onClick={copyWeek}>
                <Copy className="h-4 w-4 mr-2" />
                Copy Week
              </Button>
              <Button onClick={saveSettings} disabled={isSaving}>
                {isSaving ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Save Changes
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>

        <div className="p-6">
          <Tabs defaultValue="availability" className="space-y-6">
            <TabsList>
              <TabsTrigger value="availability">
                <Calendar className="h-4 w-4 mr-2" />
                Availability
              </TabsTrigger>
              <TabsTrigger value="notifications">
                <Bell className="h-4 w-4 mr-2" />
                Notifications
              </TabsTrigger>
              <TabsTrigger value="account">
                <UserCog className="h-4 w-4 mr-2" />
                Account
              </TabsTrigger>
              <TabsTrigger value="system">
                <SettingsIcon className="h-4 w-4 mr-2" />
                System
              </TabsTrigger>
            </TabsList>

            <TabsContent value="availability" className="space-y-6">
              {/* Weekly Schedule */}
              <Card>
                <CardHeader>
                  <CardTitle>Weekly Schedule</CardTitle>
                  <CardDescription>
                    Set your available hours for each day of the week
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {(Object.entries(dayNames) as [DayOfWeek, string][]).map(([day, dayName]) => (
                    <div key={day} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <Switch
                            checked={availability[day]?.enabled || false}
                            onCheckedChange={(enabled) => handleDayToggle(day, enabled)}
                          />
                          <Label className="font-medium">{dayName}</Label>
                        </div>
                        {availability[day]?.enabled && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => addSession(day)}
                          >
                            <Plus className="h-4 w-4 mr-1" />
                            Add Session
                          </Button>
                        )}
                      </div>
                      
                      {availability[day]?.enabled && (
                        <div className="space-y-3">
                          {(availability[day]?.sessions || []).map((session, sessionIndex) => (
                            <div key={sessionIndex} className="flex items-center gap-3">
                              <Select
                                value={session.start}
                                onValueChange={(value) => handleSessionUpdate(day, sessionIndex, 'start', value)}
                              >
                                <SelectTrigger className="w-32">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  {timeOptions.map(time => (
                                    <SelectItem key={time} value={time}>{time}</SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              
                              <span className="text-gray-500">to</span>
                              
                              <Select
                                value={session.end}
                                onValueChange={(value) => handleSessionUpdate(day, sessionIndex, 'end', value)}
                              >
                                <SelectTrigger className="w-32">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  {timeOptions.map(time => (
                                    <SelectItem key={time} value={time}>{time}</SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              
                              {(availability[day]?.sessions?.length || 0) > 1 && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => removeSession(day, sessionIndex)}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Break Hours */}
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle>Break Hours</CardTitle>
                    <CardDescription>
                      Set recurring breaks that will block appointment bookings
                    </CardDescription>
                  </div>
                  <Dialog open={showBreakDialog} onOpenChange={setShowBreakDialog}>
                    <DialogTrigger asChild>
                      <Button>
                        <Plus className="h-4 w-4 mr-2" />
                        Add Break
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Add Break</DialogTitle>
                        <DialogDescription>
                          Create a new recurring break period
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="break-name">Break Name</Label>
                          <Input
                            id="break-name"
                            value={newBreak.name}
                            onChange={(e) => setNewBreak(prev => ({ ...prev, name: e.target.value }))}
                            placeholder="e.g., Lunch Break"
                          />
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="break-start">Start Time</Label>
                            <Select value={newBreak.start} onValueChange={(value) => setNewBreak(prev => ({ ...prev, start: value }))}>
                              <SelectTrigger>
                                <SelectValue placeholder="Select time" />
                              </SelectTrigger>
                              <SelectContent>
                                {timeOptions.map(time => (
                                  <SelectItem key={time} value={time}>{time}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          
                          <div>
                            <Label htmlFor="break-end">End Time</Label>
                            <Select value={newBreak.end} onValueChange={(value) => setNewBreak(prev => ({ ...prev, end: value }))}>
                              <SelectTrigger>
                                <SelectValue placeholder="Select time" />
                              </SelectTrigger>
                              <SelectContent>
                                {timeOptions.map(time => (
                                  <SelectItem key={time} value={time}>{time}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        </div>

                        <div>
                          <Label>Days</Label>
                          <div className="grid grid-cols-2 gap-2 mt-2">
                            {(Object.entries(dayNames) as [DayOfWeek, string][]).map(([day, dayName]) => (
                              <div key={day} className="flex items-center space-x-2">
                                <input
                                  type="checkbox"
                                  id={`break-${day}`}
                                  checked={newBreak.days.includes(day)}
                                  onChange={(e) => {
                                    if (e.target.checked) {
                                      setNewBreak(prev => ({ ...prev, days: [...prev.days, day] }));
                                    } else {
                                      setNewBreak(prev => ({ ...prev, days: prev.days.filter(d => d !== day) }));
                                    }
                                  }}
                                  className="rounded"
                                />
                                <Label htmlFor={`break-${day}`} className="text-sm">{dayName}</Label>
                              </div>
                            ))}
                          </div>
                        </div>

                        <div className="flex gap-2">
                          <Button onClick={addBreak} className="flex-1">Add Break</Button>
                          <Button variant="outline" onClick={() => setShowBreakDialog(false)}>Cancel</Button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                </CardHeader>
                <CardContent>
                  {breaks.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      <Clock className="h-12 w-12 mx-auto mb-2 text-gray-400" />
                      <p>No breaks configured</p>
                      <p className="text-sm">Add breaks to block time slots from booking</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {breaks.map((breakItem) => (
                        <div key={breakItem.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div>
                            <h4 className="font-medium">{breakItem.name}</h4>
                            <p className="text-sm text-gray-600">
                              {breakItem.start} - {breakItem.end}
                            </p>
                            <div className="flex gap-1 mt-1">
                              {breakItem.days.map(day => (
                                <Badge key={day} variant="secondary" className="text-xs">
                                  {dayNames[day].slice(0, 3)}
                                </Badge>
                              ))}
                            </div>
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => removeBreak(breakItem.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Exceptions */}
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle>Exceptions</CardTitle>
                    <CardDescription>
                      Override your regular schedule for specific dates. Use exceptions to block out time for holidays, conferences, vacation days, or set special working hours.
                    </CardDescription>
                  </div>
                  <Dialog open={showExceptionDialog} onOpenChange={setShowExceptionDialog}>
                    <DialogTrigger asChild>
                      <Button>
                        <Plus className="h-4 w-4 mr-2" />
                        Add Exception
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Add Schedule Exception / Meeting</DialogTitle>
                        <DialogDescription>
                          Block time for meetings, conferences, breaks, or mark the day as unavailable. Perfect for scheduling around medical conferences, team meetings, or personal time off.
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div>
                          <Label>Date</Label>
                          <Input 
                            type="date" 
                            className="mt-1"
                            value={newException.date}
                            onChange={(e) => setNewException(prev => ({ ...prev, date: e.target.value }))}
                            min={new Date().toISOString().split('T')[0]}
                          />
                        </div>
                        
                        <div>
                          <Label>Type</Label>
                          <Select value={newException.type} onValueChange={(value) => setNewException(prev => ({ ...prev, type: value as any }))}>
                            <SelectTrigger className="mt-1">
                              <SelectValue placeholder="Select type" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="meeting">🤝 Meeting / Conference</SelectItem>
                              <SelectItem value="break">☕ Extended Break</SelectItem>
                              <SelectItem value="unavailable">❌ Day Off / Unavailable</SelectItem>
                              <SelectItem value="special_hours">🕒 Custom Working Hours</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div>
                          <Label>Name/Title</Label>
                          <Input 
                            placeholder="e.g., Medical Conference, Team Meeting, Dentist Appointment"
                            className="mt-1"
                            value={newException.name}
                            onChange={(e) => setNewException(prev => ({ ...prev, name: e.target.value }))}
                          />
                        </div>

                        {(newException.type === 'meeting' || newException.type === 'break') && (
                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <Label>Start Time</Label>
                              <Select value={newException.startTime} onValueChange={(value) => setNewException(prev => ({ ...prev, startTime: value }))}>
                                <SelectTrigger className="mt-1">
                                  <SelectValue placeholder="Start" />
                                </SelectTrigger>
                                <SelectContent>
                                  {timeOptions.map(time => (
                                    <SelectItem key={time} value={time}>{time}</SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                            <div>
                              <Label>End Time</Label>
                              <Select value={newException.endTime} onValueChange={(value) => setNewException(prev => ({ ...prev, endTime: value }))}>
                                <SelectTrigger className="mt-1">
                                  <SelectValue placeholder="End" />
                                </SelectTrigger>
                                <SelectContent>
                                  {timeOptions.map(time => (
                                    <SelectItem key={time} value={time}>{time}</SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                          </div>
                        )}

                        <div>
                          <Label>Additional Notes (Optional)</Label>
                          <Input 
                            placeholder="Location, contact info, special instructions..."
                            className="mt-1"
                            value={newException.reason}
                            onChange={(e) => setNewException(prev => ({ ...prev, reason: e.target.value }))}
                          />
                        </div>

                        <div className="bg-blue-50 p-3 rounded-lg">
                          <h4 className="text-sm font-medium text-blue-900 mb-1">Quick Examples:</h4>
                          <ul className="text-xs text-blue-800 space-y-1">
                            <li>• <strong>Meeting:</strong> "Medical Conference" 9:00 AM - 5:00 PM</li>
                            <li>• <strong>Break:</strong> "Extended Lunch - Dentist" 12:00 PM - 2:00 PM</li>
                            <li>• <strong>Day Off:</strong> "Vacation Day" (entire day blocked)</li>
                            <li>• <strong>Custom Hours:</strong> "Half Day" 9:00 AM - 1:00 PM only</li>
                          </ul>
                        </div>

                        <div className="flex gap-2">
                          <Button onClick={addException} className="flex-1" disabled={!newException.date || !newException.name}>
                            Add {newException.type === 'meeting' ? 'Meeting' : newException.type === 'break' ? 'Break' : 'Exception'}
                          </Button>
                          <Button variant="outline" onClick={() => setShowExceptionDialog(false)}>Cancel</Button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                </CardHeader>
                <CardContent>
                  {exceptions.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      <Calendar className="h-12 w-12 mx-auto mb-2 text-gray-400" />
                      <p>No exceptions set</p>
                      <p className="text-sm">Add exceptions for holidays, conferences, vacation days, meetings, or custom schedules</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {exceptions.map((exception) => (
                        <div key={exception.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-sm">
                                {exception.type === 'meeting' && '🤝'}
                                {exception.type === 'break' && '☕'}
                                {exception.type === 'unavailable' && '❌'}
                                {exception.type === 'special_hours' && '🕒'}
                              </span>
                              <h4 className="font-medium text-gray-900">{exception.name}</h4>
                              <Badge variant="secondary" className="text-xs capitalize">
                                {exception.type.replace('_', ' ')}
                              </Badge>
                            </div>
                            <p className="text-sm text-gray-600">
                              📅 {new Date(exception.date).toLocaleDateString('en-US', { 
                                weekday: 'long', 
                                year: 'numeric', 
                                month: 'long', 
                                day: 'numeric' 
                              })}
                              {exception.startTime && exception.endTime && (
                                <span> • ⏰ {exception.startTime} - {exception.endTime}</span>
                              )}
                            </p>
                            {exception.reason && (
                              <p className="text-xs text-gray-500 mt-1">📝 {exception.reason}</p>
                            )}
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => removeException(exception.id)}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="notifications" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Notification Preferences</CardTitle>
                  <CardDescription>
                    Configure how you want to receive notifications
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-base">Email Notifications</Label>
                      <p className="text-sm text-gray-600">Receive updates via email</p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-base">SMS Notifications</Label>
                      <p className="text-sm text-gray-600">Receive urgent updates via SMS</p>
                    </div>
                    <Switch />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-base">Desktop Notifications</Label>
                      <p className="text-sm text-gray-600">Show notifications in browser</p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="account" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Account Information</CardTitle>
                  <CardDescription>
                    Manage your personal information and preferences
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="first-name">First Name</Label>
                      <Input id="first-name" placeholder="Enter first name" />
                    </div>
                    <div>
                      <Label htmlFor="last-name">Last Name</Label>
                      <Input id="last-name" placeholder="Enter last name" />
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="email">Email Address</Label>
                    <Input id="email" type="email" placeholder="Enter email address" />
                  </div>
                  
                  <div>
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input id="phone" placeholder="Enter phone number" />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="system" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>System Preferences</CardTitle>
                  <CardDescription>
                    Configure system-wide settings and preferences
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-base">Dark Mode</Label>
                      <p className="text-sm text-gray-600">Use dark theme for the interface</p>
                    </div>
                    <Switch />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-base">Auto Refresh</Label>
                      <p className="text-sm text-gray-600">Automatically refresh dashboard data</p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Toast Notification */}
      {showToast && (
        <div className="fixed top-4 right-4 z-50 animate-in slide-in-from-right-full duration-300">
          <div className={`rounded-lg p-4 shadow-lg border ${
            toastType === 'success' 
              ? 'bg-green-50 border-green-200 text-green-800' 
              : 'bg-red-50 border-red-200 text-red-800'
          }`}>
            <div className="flex items-center gap-2">
              {toastType === 'success' ? (
                <div className="w-5 h-5 rounded-full bg-green-500 flex items-center justify-center">
                  <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
              ) : (
                <div className="w-5 h-5 rounded-full bg-red-500 flex items-center justify-center">
                  <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </div>
              )}
              <span className="font-medium">{toastMessage}</span>
              <button 
                onClick={() => setShowToast(false)}
                className="ml-4 hover:opacity-70"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
