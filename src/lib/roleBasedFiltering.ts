/**
 * Role-based data filtering utilities
 * Handles filtering of appointments, calendar data, dashboard metrics, and waiting lists
 * based on user roles and permissions
 */

export interface UserSession {
  id: string;
  role: string;
  practitionerId?: string;
  clinicId?: string;
}

export interface Appointment {
  id: string;
  practitionerId: string;
  patientId: string;
  patientName: string;
  practitionerName: string;
  appointmentDate: string;
  appointmentTime: string;
  status: string;
  reason?: string;
  duration?: number;
  appointmentType?: string;
  notes?: string;
  clinicId?: string;
}

export interface CalendarEvent {
  id: string;
  practitionerId: string;
  title: string;
  start: string;
  end: string;
  type: string;
  patientName?: string;
  status?: string;
}

export interface WaitingPatient {
  id: string;
  appointmentId: string;
  practitionerId: string;
  patientName: string;
  checkInTime: string;
  waitTime: number;
  status: string;
  appointmentTime: string;
}

/**
 * Determines if a user can view all practitioners' data
 * @param userRole - The role of the current user
 * @returns boolean indicating if user has full access
 */
export const canViewAllPractitioners = (userRole: string): boolean => {
  const adminRoles = ['admin', 'staff', 'nurse', 'administrator'];
  return adminRoles.includes(userRole.toLowerCase());
};

/**
 * Filters appointments based on user role and permissions
 * @param appointments - Array of all appointments
 * @param user - Current user session data
 * @returns Filtered appointments array
 */
export const filterAppointmentsByRole = (
  appointments: Appointment[],
  user: UserSession
): Appointment[] => {
  if (!appointments || appointments.length === 0) return [];

  // Admin, staff, and nurse can see all appointments
  if (canViewAllPractitioners(user.role)) {
    return appointments;
  }

  // Practitioners can only see their own appointments
  if (user.role === 'practitioner' && user.practitionerId) {
    return appointments.filter(
      appointment => appointment.practitionerId === user.practitionerId
    );
  }

  // Patients should not access this function, but just in case
  if (user.role === 'patient') {
    return appointments.filter(
      appointment => appointment.patientId === user.id
    );
  }

  // Default: no appointments visible
  return [];
};

/**
 * Filters calendar events based on user role and permissions
 * @param events - Array of all calendar events
 * @param user - Current user session data
 * @returns Filtered calendar events array
 */
export const filterCalendarEventsByRole = (
  events: CalendarEvent[],
  user: UserSession
): CalendarEvent[] => {
  if (!events || events.length === 0) return [];

  // Admin, staff, and nurse can see all calendar events
  if (canViewAllPractitioners(user.role)) {
    return events;
  }

  // Practitioners can only see their own calendar events
  if (user.role === 'practitioner' && user.practitionerId) {
    return events.filter(
      event => event.practitionerId === user.practitionerId
    );
  }

  // Default: no events visible
  return [];
};

/**
 * Filters waiting patients based on user role and permissions
 * @param waitingPatients - Array of all waiting patients
 * @param user - Current user session data
 * @returns Filtered waiting patients array
 */
export const filterWaitingPatientsByRole = (
  waitingPatients: WaitingPatient[],
  user: UserSession
): WaitingPatient[] => {
  if (!waitingPatients || waitingPatients.length === 0) return [];

  // Admin, staff, and nurse can see all waiting patients
  if (canViewAllPractitioners(user.role)) {
    return waitingPatients;
  }

  // Practitioners can only see their own waiting patients
  if (user.role === 'practitioner' && user.practitionerId) {
    return waitingPatients.filter(
      patient => patient.practitionerId === user.practitionerId
    );
  }

  // Default: no waiting patients visible
  return [];
};

/**
 * Filters dashboard metrics based on user role and permissions
 * @param allMetrics - Object containing all clinic metrics
 * @param user - Current user session data
 * @returns Filtered metrics object
 */
export const filterDashboardMetricsByRole = (
  allMetrics: any,
  user: UserSession
): any => {
  if (!allMetrics) return {};

  // Admin, staff, and nurse can see all metrics
  if (canViewAllPractitioners(user.role)) {
    return allMetrics;
  }

  // Practitioners see only their own metrics
  if (user.role === 'practitioner' && user.practitionerId) {
    return {
      ...allMetrics,
      // Filter metrics to only include data for this practitioner
      practitionerSpecific: true,
      practitionerId: user.practitionerId
    };
  }

  // Default: minimal metrics
  return {
    todaysAppointments: 0,
    waitingPatients: 0,
    completedToday: 0,
    totalPatients: 0
  };
};

/**
 * Gets a query filter object for API calls based on user role
 * @param user - Current user session data
 * @returns Query filter object for API endpoints
 */
export const getApiFilterByRole = (user: UserSession): any => {
  // Admin, staff, and nurse get no filters (see all data)
  if (canViewAllPractitioners(user.role)) {
    return {};
  }

  // Practitioners get filtered to their own data
  if (user.role === 'practitioner' && user.practitionerId) {
    return {
      practitionerId: user.practitionerId
    };
  }

  // Default: no data
  return {
    practitionerId: 'none'
  };
};

/**
 * Validates if a user can perform actions on behalf of a practitioner
 * @param userRole - Role of the current user
 * @param userPractitionerId - Practitioner ID of current user (if applicable)
 * @param targetPractitionerId - Practitioner ID of the target action
 * @returns boolean indicating if action is allowed
 */
export const canManagePractitionerData = (
  userRole: string,
  userPractitionerId: string | undefined,
  targetPractitionerId: string
): boolean => {
  // Admin, staff, and nurse can manage all practitioners' data
  if (canViewAllPractitioners(userRole)) {
    return true;
  }

  // Practitioners can only manage their own data
  if (userRole === 'practitioner' && userPractitionerId) {
    return userPractitionerId === targetPractitionerId;
  }

  return false;
};

/**
 * Gets a display message for filtered views
 * @param userRole - Role of the current user
 * @param userName - Name of the current user
 * @returns Display message string
 */
export const getFilterDisplayMessage = (userRole: string, userName?: string): string => {
  if (canViewAllPractitioners(userRole)) {
    return 'Showing data for all practitioners';
  }

  if (userRole === 'practitioner') {
    return `Showing your appointments and schedule${userName ? ` (${userName})` : ''}`;
  }

  return 'Limited data view';
};