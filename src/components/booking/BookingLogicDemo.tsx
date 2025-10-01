/**
 * Demo component to show booking logic
 * This explains how appointment scheduling works with duration, breaks, and existing bookings
 */

'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock, Calendar, AlertTriangle, CheckCircle } from 'lucide-react';

export const BookingLogicDemo = () => {
  return (
    <div className="space-y-4 p-4 bg-muted/30 rounded-lg">
      <h3 className="text-lg font-semibold flex items-center gap-2">
        <Calendar className="w-5 h-5" />
        Smart Appointment Scheduling
      </h3>
      
      <div className="grid md:grid-cols-2 gap-4">
        {/* Duration Logic */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <Clock className="w-4 h-4" />
              Duration Logic
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="text-sm">
              <Badge variant="secondary" className="mb-2">General Consultation: 30 min</Badge>
              <p className="text-muted-foreground">
                If you book at <strong>1:10 PM</strong> and the doctor has a break at <strong>1:30 PM</strong>:
              </p>
              <div className="ml-4 mt-2">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-3 h-3 text-orange-500" />
                  <span className="text-xs">1:10 PM slot will NOT be available</span>
                </div>
                <p className="text-xs text-muted-foreground ml-5">
                  Appointment would end at 1:40 PM, conflicting with doctor's break
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Buffer Logic */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <CheckCircle className="w-4 h-4" />
              Buffer Logic
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="text-sm">
              <Badge variant="secondary" className="mb-2">5-minute buffer between appointments</Badge>
              <p className="text-muted-foreground">
                If patients are booked at <strong>12:30 PM</strong> and <strong>1:00 PM</strong>:
              </p>
              <div className="ml-4 mt-2">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-3 h-3 text-orange-500" />
                  <span className="text-xs">12:45 PM slot will NOT be available</span>
                </div>
                <p className="text-xs text-muted-foreground ml-5">
                  Not enough time for 30-min appointment + buffer before 1:00 PM booking
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Example Timeline */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm">Sample Doctor Schedule (Oct 2nd)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex flex-wrap gap-1 text-xs">
              <Badge variant="outline">9:00 AM - Available</Badge>
              <Badge variant="outline">9:10 AM - Available</Badge>
              <Badge variant="outline">9:20 AM - Available</Badge>
              <Badge variant="secondary">12:30 PM - Booked (30 min)</Badge>
              <Badge variant="destructive">12:45 PM - Unavailable (insufficient time)</Badge>
              <Badge variant="destructive">1:00-2:00 PM - Doctor Break</Badge>
              <Badge variant="outline">2:10 PM - Available</Badge>
              <Badge variant="secondary">3:00 PM - Booked (30 min)</Badge>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              ✅ Available slots ensure full appointment duration + buffer time
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
