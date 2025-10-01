'use client';

import { useState } from 'react';
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
  Globe
} from 'lucide-react';

// Sample availability data
const defaultAvailability = {
  monday: { enabled: true, sessions: [{ start: '09:00', end: '17:00' }] },
  tuesday: { enabled: true, sessions: [{ start: '09:00', end: '17:00' }] },
  wednesday: { enabled: true, sessions: [{ start: '09:00', end: '17:00' }] },
  thursday: { enabled: true, sessions: [{ start: '09:00', end: '17:00' }] },
  friday: { enabled: true, sessions: [{ start: '09:00', end: '17:00' }] },
  saturday: { enabled: false, sessions: [] },
  sunday: { enabled: false, sessions: [] }
};

const defaultBreaks = [
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
  const [availability, setAvailability] = useState(defaultAvailability);
  const [breaks, setBreaks] = useState(defaultBreaks);
  const [exceptions, setExceptions] = useState([]);
  const [showBreakDialog, setShowBreakDialog] = useState(false);
  const [showExceptionDialog, setShowExceptionDialog] = useState(false);
  const [newBreak, setNewBreak] = useState({ name: '', start: '', end: '', days: [] });

  const dayNames = {
    monday: 'Monday',
    tuesday: 'Tuesday',
    wednesday: 'Wednesday',
    thursday: 'Thursday',
    friday: 'Friday',
    saturday: 'Saturday',
    sunday: 'Sunday'
  };

  const handleDayToggle = (day: string, enabled: boolean) => {
    setAvailability(prev => ({
      ...prev,
      [day]: {
        ...prev[day],
        enabled,
        sessions: enabled ? (prev[day].sessions.length === 0 ? [{ start: '09:00', end: '17:00' }] : prev[day].sessions) : []
      }
    }));
  };

  const handleSessionUpdate = (day: string, sessionIndex: number, field: 'start' | 'end', value: string) => {
    setAvailability(prev => ({
      ...prev,
      [day]: {
        ...prev[day],
        sessions: prev[day].sessions.map((session, index) =>
          index === sessionIndex ? { ...session, [field]: value } : session
        )
      }
    }));
  };

  const addSession = (day: string) => {
    setAvailability(prev => ({
      ...prev,
      [day]: {
        ...prev[day],
        sessions: [...prev[day].sessions, { start: '09:00', end: '17:00' }]
      }
    }));
  };

  const removeSession = (day: string, sessionIndex: number) => {
    setAvailability(prev => ({
      ...prev,
      [day]: {
        ...prev[day],
        sessions: prev[day].sessions.filter((_, index) => index !== sessionIndex)
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

  const saveSettings = () => {
    console.log('Saving availability settings:', { availability, breaks, exceptions });
    // Implement save functionality
  };

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
            </div>
            <div className="flex items-center gap-3">
              <Button variant="outline" onClick={copyWeek}>
                <Copy className="h-4 w-4 mr-2" />
                Copy Week
              </Button>
              <Button onClick={saveSettings}>
                <Save className="h-4 w-4 mr-2" />
                Save Changes
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
                  {Object.entries(dayNames).map(([day, dayName]) => (
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
                          {availability[day].sessions.map((session, sessionIndex) => (
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
                              
                              {availability[day].sessions.length > 1 && (
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
                            {Object.entries(dayNames).map(([day, dayName]) => (
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
                      Override your regular schedule for specific dates
                    </CardDescription>
                  </div>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Exception
                  </Button>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8 text-gray-500">
                    <Calendar className="h-12 w-12 mx-auto mb-2 text-gray-400" />
                    <p>No exceptions set</p>
                    <p className="text-sm">Add exceptions for holidays, conferences, or custom schedules</p>
                  </div>
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
    </div>
  );
}
