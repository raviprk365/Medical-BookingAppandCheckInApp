# Architecture Document - Booking and Check-In App

## 1. Executive Summary

This document defines the technical architecture for a comprehensive Booking and Check-In application for an Australian medical practice. The system comprises web applications, mobile applications, voice integration, and backend services designed to streamline appointment management while ensuring compliance with Australian healthcare regulations.

## 2. Architecture Overview

### 2.1 High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                           Presentation Layer                        │
├─────────────────────────────┬───────────────────────────────────────┤
│         Web Portal          │            Mobile Apps               │
│        (Next.js)            │         (React Native)               │
│                             │                                       │
└─────────────────────────────┴───────────────────────────────────────┘
                                    │
┌─────────────────────────────────────────────────────────────────────┐
│                           API Gateway Layer                         │
│                        (Azure API Management)                       │
└─────────────────────────────────────────────────────────────────────┘
                                    │
┌─────────────────────────────────────────────────────────────────────┐
│                         Application Layer                           │
├─────────────────┬─────────────────┬─────────────────┬──────────────┤
│  Booking Service│ Check-in Service│Profile Service  │Analytics Svc │
│  (Python FastAPI) │ (Python FastAPI) │ (Python FastAPI) │(Python FastAPI)│
└─────────────────┴─────────────────┴─────────────────┴──────────────┘
                                    │
┌─────────────────────────────────────────────────────────────────────┐
│                           Data Layer                                │
├─────────────────┬─────────────────┬─────────────────┬──────────────┤
│MongoDB on Cosmos│   Redis Cache   │  Blob Storage   │  Event Hub   │
│      DB         │   (Azure)       │   (Azure)       │   (Azure)    │
└─────────────────┴─────────────────┴─────────────────┴──────────────┘
                                    │
┌─────────────────────────────────────────────────────────────────────┐
│                       External Integrations                         │
├─────────────────┬─────────────────┬─────────────────┬──────────────┤
│    HotDoc API   │  ACS/Twilio     │  SMS/Email      │  FHIR/HL7    │
│                 │   Voice         │   Services      │  Gateway     │
└─────────────────┴─────────────────┴─────────────────┴──────────────┘
```

## 3. Technology Stack

### 3.1 Frontend Technologies

#### Web Applications

- **Framework**: Next.js 14+ with TypeScript
- **UI Library**: Material-UI (MUI) for consistent design
- **State Management**: Zustand for lightweight state management
- **Authentication**: NextAuth.js with Azure AD B2C
- **SSR/SSG**: Server-side rendering and static generation
- **PWA Support**: Next.js PWA plugin for offline capability
- **Accessibility**: WCAG 2.1 AA compliance

#### Mobile Applications
- **Framework**: React Native with TypeScript
- **Navigation**: React Navigation 6
- **State Management**: Redux Toolkit
- **Authentication**: Azure AD B2C Mobile SDK
- **Push Notifications**: Firebase Cloud Messaging
- **Offline Storage**: AsyncStorage + SQLite
- **Biometric Auth**: React Native Biometrics



### 3.2 Backend Technologies

#### Application Services

- **Framework**: Python 3.11+ with FastAPI
- **API Pattern**: RESTful APIs with automatic OpenAPI/Swagger
- **Authentication**: JWT tokens with Azure AD B2C integration
- **Authorization**: Role-based access control (RBAC)
- **Validation**: Pydantic models for request/response validation
- **Logging**: Structured logging with Python logging + Azure Application Insights
- **Health Checks**: FastAPI health check endpoints
- **Async Support**: Native async/await for database operations

#### Infrastructure
- **Cloud Platform**: Microsoft Azure (Australia East/Southeast)
- **Container Orchestration**: Azure Container Apps
- **API Gateway**: Azure API Management
- **Load Balancer**: Azure Application Gateway
- **CDN**: Azure Front Door

### 3.3 Data Technologies

#### Primary Database

- **Database**: Azure Cosmos DB for MongoDB
- **ODM**: Motor (async MongoDB driver) with Beanie ODM
- **Schema**: Document-based with flexible schema evolution
- **Backup**: Automated continuous backups with point-in-time restore
- **Scaling**: Automatic horizontal scaling with request units (RUs)

#### Caching
- **Technology**: Azure Cache for Redis
- **Purpose**: Session storage, API response caching
- **Configuration**: Standard tier with persistence

#### File Storage
- **Technology**: Azure Blob Storage
- **Purpose**: Document uploads, profile images
- **Security**: SAS tokens for secure access

#### Analytics
- **Technology**: Azure Event Hubs + Azure Stream Analytics
- **Purpose**: Real-time analytics and reporting
- **Storage**: Azure Data Lake for historical data

## 4. System Components

### 4.1 Core Services

#### Booking Service

```python
# Core booking functionality
- Appointment scheduling and management
- Integration with HotDoc API
- Availability calculation
- Conflict detection and resolution
- Notification triggers
```

#### Check-in Service

```python
# Patient check-in management
- QR code generation and validation
- Mobile check-in processing
- Wait time calculations
- Staff notifications
```

#### Profile Service

```python
# Patient profile management
- User registration and authentication
- Profile data management
- Document upload handling
- Consent management
- GDPR/Privacy Act compliance
```

#### Notification Service

```python
# Multi-channel notifications
- SMS via Twilio
- Email via SendGrid
- Push notifications via FCM
- Voice notifications via ACS
- Preference management
```

#### Voice Service

```python
# Voice interaction handling
- ACS/Twilio integration
- Natural language processing
- Voice command routing
- Audio processing
- Conversation state management
```

### 4.2 Data Models

#### Core Entities

```python
from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel
from beanie import Document
from bson import ObjectId

class Address(BaseModel):
    street: str
    city: str
    state: str
    postcode: str
    country: str = "Australia"

class ConsentSettings(BaseModel):
    marketing_emails: bool = False
    sms_reminders: bool = True
    voice_reminders: bool = False
    data_sharing: bool = False
    updated_at: datetime

class Patient(Document):
    first_name: str
    last_name: str
    email: str
    phone_number: str
    date_of_birth: datetime
    medicare_number: Optional[str]
    address: Address
    consent_settings: ConsentSettings
    created_at: datetime
    updated_at: datetime
    
    class Settings:
        collection = "patients"

class CheckInDetails(BaseModel):
    check_in_time: Optional[datetime]
    method: str  # "mobile", "voice", "manual"
    device_id: Optional[str]
    qr_code: Optional[str]
    status: str  # "pending", "checked_in", "completed"

class Appointment(Document):
    patient_id: ObjectId
    practitioner_id: ObjectId
    scheduled_datetime: datetime
    duration_minutes: int = 30
    appointment_type: str
    status: str  # "scheduled", "confirmed", "completed", "cancelled"
    notes: Optional[str]
    check_in: Optional[CheckInDetails]
    external_booking_id: Optional[str]  # HotDoc reference
    created_at: datetime
    updated_at: datetime
    
    class Settings:
        collection = "appointments"
```

## 5. Security Architecture

### 5.1 Authentication & Authorization

#### Identity Management
- **Provider**: Azure AD B2C
- **User Flows**: Custom policies for registration, login, password reset
- **Multi-Factor Authentication**: SMS/Email verification
- **Social Logins**: Optional Google/Facebook integration

#### API Security
- **Authentication**: Bearer JWT tokens
- **Authorization**: Role-based access control
- **API Keys**: For external service integration
- **Rate Limiting**: Azure API Management policies

#### Data Protection
- **Encryption in Transit**: TLS 1.3 for all communications
- **Encryption at Rest**: Azure SQL TDE, Blob Storage encryption
- **Key Management**: Azure Key Vault
- **Certificate Management**: Azure Key Vault certificates

### 5.2 Privacy & Compliance

#### Australian Privacy Act Compliance
- **Data Minimization**: Collect only necessary data
- **Purpose Limitation**: Use data only for stated purposes
- **Consent Management**: Granular consent controls
- **Data Portability**: Export functionality
- **Right to be Forgotten**: Automated data deletion

#### Healthcare Compliance
- **HL7/FHIR**: Interoperability standards where applicable
- **Audit Logging**: Comprehensive access logs
- **Data Sovereignty**: All data stored in Australia
- **Backup & Recovery**: Automated disaster recovery

## 6. Integration Architecture

### 6.1 External System Integrations

#### HotDoc Integration
```yaml
Integration Type: REST API
Authentication: OAuth 2.0
Endpoints:
  - GET /appointments - Sync existing appointments
  - POST /appointments - Create new appointments
  - PUT /appointments/{id} - Update appointments
  - DELETE /appointments/{id} - Cancel appointments
Sync Frequency: Real-time webhooks + 15-minute polling
Error Handling: Retry logic with exponential backoff
```

#### Voice Integration (ACS/Twilio)
```yaml
Integration Type: WebRTC + REST API
Services:
  - Call routing and IVR
  - Speech-to-text conversion
  - Natural language processing
  - Text-to-speech synthesis
Features:
  - Australian accent recognition
  - Medical terminology support
  - Multi-language support
```

#### Communication Services
```yaml
SMS: Twilio SMS API
Email: SendGrid API
Push Notifications: Firebase Cloud Messaging
Voice Calls: Azure Communication Services
```

### 6.2 API Design

#### RESTful API Standards
- **Versioning**: URI versioning (v1, v2)
- **Response Format**: JSON with consistent error structure
- **HTTP Status Codes**: Standard HTTP status codes
- **Pagination**: Cursor-based pagination
- **Filtering**: Query parameter filtering

#### Example API Endpoints
```http
# Appointments
GET    /api/v1/appointments
POST   /api/v1/appointments
GET    /api/v1/appointments/{id}
PUT    /api/v1/appointments/{id}
DELETE /api/v1/appointments/{id}

# Check-in
POST   /api/v1/checkin
GET    /api/v1/checkin/status/{appointmentId}
PUT    /api/v1/checkin/{id}/status

# Patients
GET    /api/v1/patients/profile
PUT    /api/v1/patients/profile
POST   /api/v1/patients/documents
```

## 7. Deployment Architecture

### 7.1 Environment Strategy

#### Environments

- **Development**: Local development with Docker Compose
- **Testing**: Azure Container Apps test environment
- **Staging**: Production-like Azure environment
- **Production**: Azure production environment (Australia)

#### CI/CD Pipeline

```yaml
Source Control: Azure DevOps Git
Build: Azure Pipelines with Python
Testing: pytest for unit/integration tests
Security: Bandit (SAST) + OWASP ZAP (DAST)
Deployment: Blue-green deployment to Azure Container Apps
Monitoring: Azure Application Insights with Python SDK
```

### 7.2 Infrastructure as Code

#### Azure Resource Manager Templates

```json
{
  "resources": [
    {
      "type": "Microsoft.App/containerApps",
      "name": "booking-app-api",
      "properties": {
        "configuration": {
          "ingress": {
            "external": true,
            "targetPort": 8000
          }
        },
        "template": {
          "containers": [{
            "name": "fastapi-app",
            "image": "your-registry.azurecr.io/booking-api:latest",
            "env": [
              {
                "name": "MONGODB_CONNECTION_STRING",
                "secretRef": "cosmos-connection-string"
              }
            ]
          }]
        }
      }
    },
    {
      "type": "Microsoft.DocumentDB/databaseAccounts",
      "name": "booking-cosmos-db",
      "properties": {
        "databaseAccountOfferType": "Standard",
        "kind": "MongoDB",
        "apiProperties": {
          "serverVersion": "4.2"
        }
      }
    }
  ]
}
```

### 7.3 Scalability & Performance

#### Auto-scaling Configuration

- **Container Apps**: HTTP request-based scaling
- **Database**: Cosmos DB auto-scale with request units
- **Cache**: Redis cluster mode for high availability
- **CDN**: Global content distribution

#### Performance Targets
- **Web App Load Time**: < 3 seconds
- **Mobile App Response**: < 1 second
- **API Response Time**: < 500ms (95th percentile)
- **Database Query Time**: < 100ms average

## 8. Monitoring & Observability

### 8.1 Application Monitoring

#### Azure Application Insights
- **Performance Monitoring**: Request/response times
- **Error Tracking**: Exception logging and alerting
- **User Analytics**: Usage patterns and behaviors
- **Custom Metrics**: Business-specific KPIs

#### Logging Strategy

```python
# Structured logging example
import logging
from datetime import datetime

logger = logging.getLogger(__name__)

logger.info(
    "Appointment booked",
    extra={
        "appointment_id": appointment.id,
        "patient_id": appointment.patient_id,
        "scheduled_datetime": appointment.scheduled_datetime.isoformat(),
        "event_type": "appointment_booked"
    }
)
```

### 8.2 Health Monitoring

#### Health Check Endpoints
- **Application Health**: /health
- **Database Health**: /health/database
- **External Dependencies**: /health/external
- **Detailed Health**: /health/detailed

#### Alerting Rules
- **High Priority**: System downtime, database failures
- **Medium Priority**: Performance degradation, high error rates
- **Low Priority**: Unusual usage patterns, capacity warnings

## 9. Disaster Recovery & Business Continuity

### 9.1 Backup Strategy

#### Database Backups
- **Frequency**: Automated daily backups
- **Retention**: 7 days short-term, monthly long-term
- **Geographic Replication**: Australia Southeast secondary region
- **Recovery Time Objective (RTO)**: < 4 hours
- **Recovery Point Objective (RPO)**: < 1 hour

#### Application Deployment
- **Blue-Green Deployments**: Zero-downtime deployments
- **Rollback Strategy**: Automated rollback on health check failures
- **Data Migration**: Backward compatible database changes

### 9.2 High Availability

#### Multi-Region Setup
- **Primary Region**: Australia East
- **Secondary Region**: Australia Southeast
- **Failover**: Automatic DNS failover
- **Data Sync**: Geo-replication for critical data

## 10. Security Implementation

### 10.1 Application Security

#### Web Application Security
- **HTTPS Enforcement**: Strict Transport Security headers
- **Content Security Policy**: XSS protection
- **CORS Configuration**: Restricted origins
- **Input Validation**: Server-side validation for all inputs
- **SQL Injection Prevention**: Parameterized queries only

#### Mobile Application Security
- **Certificate Pinning**: Prevent man-in-the-middle attacks
- **Code Obfuscation**: Protect against reverse engineering
- **Biometric Authentication**: Local biometric verification
- **Secure Storage**: Encrypted local data storage

### 10.2 Data Security

#### Personal Health Information (PHI)
- **Field-Level Encryption**: Sensitive data encryption
- **Access Controls**: Role-based data access
- **Audit Trails**: All data access logged
- **Data Masking**: Non-production environment data protection

## 11. Cost Optimization

### 11.1 Azure Cost Management

#### Resource Optimization

- **Reserved Instances**: 1-3 year reservations for Cosmos DB
- **Auto-scaling**: Container Apps scale to zero during off-hours
- **Storage Tiers**: Appropriate storage tiers for different data types
- **Development Environments**: Shut down when not in use

#### Estimated Monthly Costs (AUD)

- **Container Apps**: $200-400
- **Cosmos DB**: $300-600
- **Storage & CDN**: $50-100
- **Monitoring & Security**: $100-200
- **Total Estimated**: $650-1,300 per month

## 12. Implementation Roadmap

### 12.1 Phase 1: Core Platform (Months 1-3)

- [ ] Basic Next.js web application with appointment booking
- [ ] Patient registration and profile management
- [ ] HotDoc integration
- [ ] Basic mobile app (iOS/Android)
- [ ] SMS/Email notifications
- [ ] Python FastAPI backend services
- [ ] MongoDB on Cosmos DB setup

### 12.2 Phase 2: Enhanced Features (Months 4-6)

- [ ] Mobile check-in functionality
- [ ] Staff dashboard and analytics
- [ ] Advanced security implementation
- [ ] Performance optimization
- [ ] Comprehensive testing

### 12.3 Phase 3: Advanced Capabilities (Months 7-9)

- [ ] Voice integration (ACS/Twilio)
- [ ] Advanced analytics and reporting
- [ ] FHIR/HL7 compliance
- [ ] Enhanced accessibility features
- [ ] Production deployment

### 12.4 Phase 4: Optimization (Months 10-12)

- [ ] Performance tuning
- [ ] User feedback integration
- [ ] Advanced monitoring and alerting
- [ ] Disaster recovery testing
- [ ] Documentation and training

## 13. Technical Decisions & Rationale

### 13.1 Architecture Decisions

#### Microservices vs Modular Monolith
**Decision**: Modular Monolith
**Rationale**: 
- Single medical practice scope
- Easier deployment and maintenance
- Lower operational complexity
- Cost-effective for the scale

#### Cloud Provider Selection
**Decision**: Microsoft Azure
**Rationale**:
- Strong presence in Australia
- Excellent healthcare compliance features
- Integrated development toolchain
- Azure AD B2C for identity management

#### Database Choice

**Decision**: Azure Cosmos DB for MongoDB
**Rationale**:
- Document-based storage ideal for flexible healthcare data
- Global distribution and multi-region writes
- Automatic scaling and high availability
- Strong consistency guarantees
- Built-in security features

### 13.2 Technology Rationale

#### Frontend Framework Choice

**Decision**: Next.js/React Native
**Rationale**:
- Server-side rendering for better SEO and performance
- Code sharing between web and mobile
- Excellent developer experience and tooling
- Strong ecosystem and community support
- Built-in optimization features

#### Backend Framework Choice

**Decision**: Python FastAPI
**Rationale**:
- High performance async framework
- Automatic API documentation generation
- Strong typing with Pydantic
- Excellent Azure integration
- Rich ecosystem for healthcare integrations
- Easy to scale and maintain

## 14. Conclusion

This architecture provides a robust, scalable, and secure foundation for the Booking and Check-In application using modern technologies. The design prioritizes:

- **Compliance**: Full adherence to Australian healthcare regulations
- **Security**: Multi-layered security approach with encryption and access controls
- **Scalability**: Cloud-native design with auto-scaling capabilities using Azure Container Apps
- **Performance**: Next.js SSR for fast web experiences and FastAPI for high-performance APIs
- **Developer Experience**: Modern tooling with Python FastAPI and Next.js
- **Data Flexibility**: MongoDB on Cosmos DB for flexible healthcare data modeling
- **Usability**: Platform-optimized user experiences for web and mobile
- **Maintainability**: Clean architecture with separation of concerns
- **Cost-effectiveness**: Container-based deployment optimized for a single practice

The phased implementation approach ensures manageable development cycles while delivering value incrementally to the medical practice and its patients. The technology stack provides excellent performance, developer productivity, and long-term maintainability.
