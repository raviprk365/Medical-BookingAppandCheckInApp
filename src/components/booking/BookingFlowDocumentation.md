# Medical Booking App - Step-by-Step Booking Flow

## Overview
This document outlines the comprehensive booking flow implementation for the medical booking application, following the specified requirements.

## Flow Steps

### Step 1: Who is the booking for?
- "Myself" or "Someone else"
- If "Someone else", collect relationship and consent

### Step 2: Patient Type
- Existing Patient → Auto-fetch details
- New Patient → Quick registration form

### Step 3: Appointment Reason & Duration
- Standard Appointment → 15 mins
- Long Appointment → 30 mins  
- Prolonged Appointment → 60 mins

### Step 4: Doctor Selection
- Filter by clinic, specialty, availability
- Show doctor profiles with ratings

### Step 5: Date & Time Selection
- Calendar view with available slots
- Slots filtered by appointment duration
- Consider doctor breaks and unavailability

### Step 6: Booking Summary
- Review all details before confirmation
- Edit capability for any step

### Step 7: Confirmation
- Create booking record
- Send confirmations (SMS/Email)
- Generate QR code for check-in

## Technical Implementation
See the TypeScript/React components in the following files:
- BookingWizardEnhanced.tsx (main flow coordinator)
- Enhanced step components for each phase
- Utility functions for availability calculation
- Database integration examples
