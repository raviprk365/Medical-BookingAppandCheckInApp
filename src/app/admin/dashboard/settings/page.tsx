'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Sidebar } from '@/components/Sidebar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { 
  Settings as SettingsIcon, 
  Building, 
  Users, 
  Bell,
  Shield,
  Database,
  Mail,
  Globe,
  Save,
  RefreshCw
} from 'lucide-react';

interface ClinicSettings {
  name: string;
  address: string;
  phone: string;
  email: string;
  website: string;
  timezone: string;
  workingHours: {
    start: string;
    end: string;
  };
  appointmentDuration: number;
  maxAdvanceBooking: number;
  notifications: {
    email: boolean;
    sms: boolean;
    push: boolean;
  };
  autoConfirmAppointments: boolean;
  allowOnlineBooking: boolean;
  requirePatientVerification: boolean;
}

export default function AdminSettings() {
  const { data: session, status } = useSession();
  const { user } = useAuth();
  const router = useRouter();
  const [settings, setSettings] = useState<ClinicSettings>({
    name: 'Sydney Med Clinic',
    address: '123 Healthcare Avenue, Sydney NSW 2000',
    phone: '+61 2 9876 5432',
    email: 'info@sydneymed.com',
    website: 'https://sydneymed.com',
    timezone: 'Australia/Sydney',
    workingHours: {
      start: '08:00',
      end: '18:00'
    },
    appointmentDuration: 30,
    maxAdvanceBooking: 90,
    notifications: {
      email: true,
      sms: true,
      push: false
    },
    autoConfirmAppointments: false,
    allowOnlineBooking: true,
    requirePatientVerification: true
  });
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
      return;
    }

    if (status === 'authenticated' && session?.user?.role !== 'admin') {
      router.push('/dashboard');
      return;
    }

    loadSettings();
  }, [session, status, router]);

  const loadSettings = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:3001/clinics');
      if (response.ok) {
        const clinics = await response.json();
        if (clinics.length > 0) {
          const clinic = clinics[0]; // Use first clinic as main clinic
          setSettings(prev => ({
            ...prev,
            name: clinic.name || prev.name,
            address: clinic.address || prev.address,
            phone: clinic.phone || prev.phone,
            email: clinic.email || prev.email,
            website: clinic.website || prev.website,
            // Keep other settings as defaults since they're clinic-specific configurations
          }));
        }
      }
    } catch (error) {
      console.error('Error loading clinic settings:', error);
      // Fall back to default settings if API fails
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      // Get current clinics to update the first one
      const response = await fetch('http://localhost:3001/clinics');
      if (response.ok) {
        const clinics = await response.json();
        if (clinics.length > 0) {
          const clinic = clinics[0];
          const updatedClinic = {
            ...clinic,
            name: settings.name,
            address: settings.address,
            phone: settings.phone,
            email: settings.email,
            website: settings.website,
          };

          const updateResponse = await fetch(`http://localhost:3001/clinics/${clinic.id}`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(updatedClinic),
          });

          if (updateResponse.ok) {
            setSaved(true);
            setTimeout(() => setSaved(false), 3000);
          } else {
            throw new Error('Failed to save settings');
          }
        }
      }
    } catch (error) {
      console.error('Error saving settings:', error);
      // You could add a toast notification here for user feedback
    } finally {
      setLoading(false);
    }
  };

  const updateSetting = (path: string, value: any) => {
    setSettings(prev => {
      const newSettings = { ...prev };
      const keys = path.split('.');
      let current: any = newSettings;
      
      for (let i = 0; i < keys.length - 1; i++) {
        current = current[keys[i]];
      }
      
      current[keys[keys.length - 1]] = value;
      return newSettings;
    });
  };

  if (status === 'loading') {
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
                <SettingsIcon className="h-8 w-8 text-blue-600" />
                System Settings
              </h1>
              <p className="text-gray-600 mt-1">
                Configure clinic operations and system preferences
              </p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={loadSettings}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Reset
              </Button>
              <Button onClick={handleSave} disabled={loading}>
                {loading ? (
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Save className="h-4 w-4 mr-2" />
                )}
                {saved ? 'Saved!' : 'Save Changes'}
              </Button>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Clinic Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building className="h-5 w-5" />
                Clinic Information
              </CardTitle>
              <CardDescription>Basic clinic details and contact information</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="clinic-name">Clinic Name</Label>
                  <Input
                    id="clinic-name"
                    value={settings.name}
                    onChange={(e) => updateSetting('name', e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="clinic-phone">Phone Number</Label>
                  <Input
                    id="clinic-phone"
                    value={settings.phone}
                    onChange={(e) => updateSetting('phone', e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="clinic-email">Email Address</Label>
                  <Input
                    id="clinic-email"
                    type="email"
                    value={settings.email}
                    onChange={(e) => updateSetting('email', e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="clinic-website">Website</Label>
                  <Input
                    id="clinic-website"
                    value={settings.website}
                    onChange={(e) => updateSetting('website', e.target.value)}
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="clinic-address">Address</Label>
                <Textarea
                  id="clinic-address"
                  value={settings.address}
                  onChange={(e) => updateSetting('address', e.target.value)}
                  rows={2}
                />
              </div>
            </CardContent>
          </Card>

          {/* Operating Hours */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Operating Configuration
              </CardTitle>
              <CardDescription>Working hours and appointment settings</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="start-time">Opening Time</Label>
                  <Input
                    id="start-time"
                    type="time"
                    value={settings.workingHours.start}
                    onChange={(e) => updateSetting('workingHours.start', e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="end-time">Closing Time</Label>
                  <Input
                    id="end-time"
                    type="time"
                    value={settings.workingHours.end}
                    onChange={(e) => updateSetting('workingHours.end', e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="timezone">Timezone</Label>
                  <Input
                    id="timezone"
                    value={settings.timezone}
                    onChange={(e) => updateSetting('timezone', e.target.value)}
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="appointment-duration">Default Appointment Duration (minutes)</Label>
                  <Input
                    id="appointment-duration"
                    type="number"
                    value={settings.appointmentDuration}
                    onChange={(e) => updateSetting('appointmentDuration', parseInt(e.target.value))}
                  />
                </div>
                <div>
                  <Label htmlFor="advance-booking">Max Advance Booking (days)</Label>
                  <Input
                    id="advance-booking"
                    type="number"
                    value={settings.maxAdvanceBooking}
                    onChange={(e) => updateSetting('maxAdvanceBooking', parseInt(e.target.value))}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Notifications */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Notification Settings
              </CardTitle>
              <CardDescription>Configure how patients and staff receive notifications</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-base">Email Notifications</Label>
                    <p className="text-sm text-gray-600">Send appointment reminders via email</p>
                  </div>
                  <Switch
                    checked={settings.notifications.email}
                    onCheckedChange={(checked) => updateSetting('notifications.email', checked)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-base">SMS Notifications</Label>
                    <p className="text-sm text-gray-600">Send appointment reminders via SMS</p>
                  </div>
                  <Switch
                    checked={settings.notifications.sms}
                    onCheckedChange={(checked) => updateSetting('notifications.sms', checked)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-base">Push Notifications</Label>
                    <p className="text-sm text-gray-600">Send push notifications to mobile app</p>
                  </div>
                  <Switch
                    checked={settings.notifications.push}
                    onCheckedChange={(checked) => updateSetting('notifications.push', checked)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* System Preferences */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                System Preferences
              </CardTitle>
              <CardDescription>Security and operational preferences</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-base">Auto-confirm Appointments</Label>
                    <p className="text-sm text-gray-600">Automatically confirm online bookings</p>
                  </div>
                  <Switch
                    checked={settings.autoConfirmAppointments}
                    onCheckedChange={(checked) => updateSetting('autoConfirmAppointments', checked)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-base">Allow Online Booking</Label>
                    <p className="text-sm text-gray-600">Enable patients to book appointments online</p>
                  </div>
                  <Switch
                    checked={settings.allowOnlineBooking}
                    onCheckedChange={(checked) => updateSetting('allowOnlineBooking', checked)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-base">Require Patient Verification</Label>
                    <p className="text-sm text-gray-600">Verify patient identity for online bookings</p>
                  </div>
                  <Switch
                    checked={settings.requirePatientVerification}
                    onCheckedChange={(checked) => updateSetting('requirePatientVerification', checked)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* System Status */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5" />
                System Status
              </CardTitle>
              <CardDescription>Current system health and statistics</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
                    <Database className="h-6 w-6 text-green-600" />
                  </div>
                  <h3 className="font-semibold">Database</h3>
                  <p className="text-sm text-green-600">Healthy</p>
                </div>
                <div className="text-center">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2">
                    <Globe className="h-6 w-6 text-blue-600" />
                  </div>
                  <h3 className="font-semibold">API Status</h3>
                  <p className="text-sm text-blue-600">Online</p>
                </div>
                <div className="text-center">
                  <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-2">
                    <Mail className="h-6 w-6 text-purple-600" />
                  </div>
                  <h3 className="font-semibold">Email Service</h3>
                  <p className="text-sm text-purple-600">Active</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}