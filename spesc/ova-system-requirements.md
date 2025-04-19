# OVA System Requirements Specification

## Overview

The Occupational Violence and Aggression (OVA) System is designed to help organizations manage, report, and respond to workplace incidents of violence and aggression. This system provides a comprehensive solution for tracking incidents, managing investigations, and ensuring appropriate follow-up actions.

## Technology Stack

- **Frontend**: Next.js, Tailwind CSS, ShadCN UI
- **Backend**: Next.js API Routes
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: NextAuth.js

## Functional Requirements

### 1. User Roles and Permissions

#### 1.1 Role Management
- Implement dynamic user roles with configurable permission levels
- Core roles to include:
  - **Admin**: Full system access
  - **Manager**: Department-level access and oversight
  - **HR**: Access to all incidents and reporting features
  - **Safety Officer**: Access to incident review and safety recommendations
  - **Employee**: Basic access to report incidents and view their own reports
  - **Investigator**: Specialized access for detailed incident investigation

#### 1.2 Permission Controls
- Granular permission settings for each role including:
  - Create/report incidents
  - View incidents (all, department-only, or self-reported)
  - Edit/update incidents
  - Assign incidents to departments or individuals
  - Close/resolve incidents
  - Generate reports and analytics
  - System configuration access

#### 1.3 Role Assignment
- Ability for administrators to assign/modify user roles
- Support for users having multiple roles if needed
- Department-specific role assignments

### 2. Incident Reporting

#### 2.1 Incident Report Form
- User-friendly multi-step form for incident reporting
- Required fields:
  - Date and time of incident
  - Location (building, floor, room, etc.)
  - Type of incident (dropdown with categories)
  - Severity level assessment
  - Involved parties (staff, patients, visitors, external parties)
  - Detailed description of the incident
  - Actions taken at the time of incident
  - Witnesses
  - Immediate outcome

#### 2.2 Supporting Evidence
- Ability to upload and attach:
  - Photos
  - Videos (with size limitations)
  - Documents (PDF, Word, etc.)
  - Audio recordings
- Preview capabilities for uploaded content
- Secure storage with access controls

#### 2.3 Confidentiality and Privacy
- Option to mark reports as confidential
- Anonymous reporting option
- GDPR and privacy law compliance
- Personal data protection measures
- Consent management for information sharing

#### 2.4 Mobile Support
- Responsive design for mobile reporting
- Simplified mobile form for urgent reporting
- Offline capabilities with later synchronization

### 3. Incident Management

#### 3.1 Dashboard and Overview
- Comprehensive dashboard showing:
  - Recent incidents
  - Incidents by status
  - Incidents by department
  - Incidents by type and severity
  - Overdue follow-ups
  - Key metrics and trends

#### 3.2 Incident Tracking
- Each incident to have a unique identifier
- Status tracking (New, Under Investigation, Pending Review, Resolved, Closed)
- Audit trail showing all actions and changes
- Timeline view of incident progression

#### 3.3 Investigation Tools
- Investigator assignment
- Structured investigation template
- Ability to record interviews and findings
- Root cause analysis tools
- Recommendation documentation
- Follow-up action tracking

#### 3.4 Workflow and Escalation
- Configurable workflows based on incident type and severity
- Automatic escalation for high-severity incidents
- Notification system for new assignments and status changes
- SLA monitoring for response times
- Approval processes for closing incidents

#### 3.5 Departmental Referrals
- Ability to refer incidents to different departments
- Inter-departmental collaboration features
- Tracking of departmental responsibilities and actions
- Departmental performance metrics for incident handling

### 4. Reporting and Analytics

#### 4.1 Standard Reports
- Incident frequency by type, location, time
- Resolution time analysis
- Trend analysis over time
- Departmental performance reports
- Compliance reports for regulatory requirements

#### 4.2 Custom Reports
- Report builder interface
- Customizable filters and parameters
- Export options (PDF, Excel, CSV)
- Scheduled report generation and distribution

#### 4.3 Data Visualization
- Interactive charts and graphs
- Heat maps for location-based analysis
- Trend visualization
- Comparative analysis tools

### 5. Notifications and Alerts

#### 5.1 Notification System
- Email notifications for key events
- In-app notification center
- SMS alerts for critical incidents
- Customizable notification preferences

#### 5.2 Reminder System
- Automated reminders for pending actions
- Escalation alerts for overdue items
- Follow-up reminders for post-incident review

### 6. Resource Management

#### 6.1 Knowledge Base
- Repository for policies and procedures
- Best practice guides
- Training materials
- Legal references

#### 6.2 Support Resources
- Contact information for support services
- Emergency response protocols
- External reporting requirements

## Non-Functional Requirements

### 1. Security

- Role-based access control
- Data encryption in transit and at rest
- Regular security audits
- Compliance with security standards (ISO 27001)
- Secure API endpoints

### 2. Performance

- Page load times under 2 seconds
- Support for concurrent users (minimum 500)
- Response time for database queries under 500ms
- Efficient handling of file uploads

### 3. Reliability

- 99.9% system uptime
- Automated backups
- Disaster recovery plan
- Graceful error handling

### 4. Scalability

- Horizontal scaling capability
- Database performance optimization
- Efficient caching mechanisms

### 5. Usability

- Intuitive user interface
- Consistent design language using ShadCN components
- Responsive design for all devices
- Accessibility compliance (WCAG 2.1)
- Multi-language support

### 6. Integration

- API endpoints for integration with other systems
- SSO capability
- Integration with HR systems
- Export/import functionality

## Database Schema (High-Level)

The system will use PostgreSQL with Prisma ORM, with the following key entities:

- **User**: User accounts with role assignments
- **Role**: Role definitions with permission sets
- **Permission**: Individual permissions that can be assigned to roles
- **Department**: Organizational structure units
- **Incident**: Core incident reports
- **Evidence**: Attachments and uploads related to incidents
- **Investigation**: Investigation details and findings
- **Action**: Follow-up actions assigned from incidents
- **Notification**: System notifications and alerts
- **AuditLog**: Record of all system actions

## Implementation Priorities

### Phase 1
- User authentication and role management
- Basic incident reporting form
- Simple dashboard views
- Core notification system

### Phase 2
- Advanced incident management features
- Investigation tools
- Departmental referrals
- Basic reporting

### Phase 3
- Advanced analytics
- Knowledge base
- Mobile optimizations
- Integration capabilities

## Conclusion

This requirements specification outlines the core functionality for the OVA System. Implementation should follow best practices for Next.js development, utilize Tailwind and ShadCN for consistent UI, and leverage Prisma with PostgreSQL for reliable data management. 