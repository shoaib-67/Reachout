# Reachout

## SRS Model

### 1. Introduction

#### 1.1 Purpose
The purpose of this SRS is to specify the functional and non-functional requirements of ReachOut, a community platform that supports blood donation requests and lost & found item recovery. This document will guide design, development, testing, and evaluation of the system.

#### 1.2 Intended Audience
- Course instructor/evaluators for assessment
- Project team members including developers, testers, and documenters
- Future maintainers who upgrade or extend the system

#### 1.3 Intended Use
ReachOut will be used by:
- People who need blood urgently to create requests and contact donors
- Volunteer donors to register, show availability, and respond to requests
- Community members to post lost/found items and communicate for recovery
- Admins/moderators to manage reports, remove spam, and maintain safety

#### 1.4 Product Scope
ReachOut provides two main services:

1. Blood Donation Support
- Donor registration with blood group, location, and availability
- Search donors by blood group and area
- Create emergency blood requests and receive donor responses
- Request tracking with open/closed status and notifications

2. Lost & Found Support
- Create lost/found posts with details, date, and location
- Search and filter posts
- Contact and messaging between users
- Mark cases as resolved
- Report spam or scam posts

#### 1.5 Risk Definitions
- Fake donor/scam risk: users may provide false info or misuse requests
- Privacy risk: contact info may be exposed if not controlled
- Wrong match risk: lost/found matching may suggest incorrect results
- Abuse/spam risk: posting spam or harassment in messaging
- System risk: server downtime, data loss, or weak authentication

### 2. Overall Description

#### 2.1 User Classes and Characteristics
- General User: registers, searches, creates posts or requests
- Donor: maintains donor profile and availability
- Requester: creates blood requests and closes them after success
- Admin/Moderator: handles reports, removes posts, and blocks users

#### 2.2 User Needs
- Fast donor search by blood group and location
- Easy blood request posting during emergencies
- Safe contact and messaging to avoid scams
- Simple lost/found posting and quick searching
- A way to report suspicious users or posts
- Admin control to keep the platform clean and trustworthy

#### 2.3 Operating Environment
- Web application for PC/mobile browsers and/or Android app as optional
- Backend server with REST API
- Database such as MySQL, PostgreSQL, or MongoDB
- Internet connection required

#### 2.4 Constraints
- Must be simple and usable for non-technical users
- SMS/OTP can be mocked and is not mandatory for the course project
- Location can be manual area selection, with no required GPS
- Limited time and resources mean MVP features should come first

#### 2.5 Assumptions
- Users provide correct blood group and location
- Donors follow health rules and donate responsibly
- Admin moderation is available to handle abuse
- Users have basic internet access

### 3. Requirements

#### 3.1 Functional Requirements

##### Authentication and Profile
- FR-1: Register, login, and logout users
- FR-2: Edit user profile including name, location, and contact preference

##### Blood Donation Module
- FR-3: Create donor profile with blood group and availability
- FR-4: Search donors by blood group and area
- FR-5: Create blood request with group, hospital, urgency, and location
- FR-6: Donor can accept or decline request
- FR-7: Requester can close request as completed or canceled

##### Lost and Found Module
- FR-8: Create lost/found post with details, date, location, and optional image
- FR-9: Search and filter posts by category, type, and area
- FR-10: Mark post as resolved

##### Communication and Safety
- FR-11: Messaging/contact between users for posts and requests
- FR-12: Report user, post, or request for spam, scam, or abuse
- FR-13: Admin can remove content and block users

#### 3.2 Non-Functional Requirements
- NFR-1 Security: password hashing and role-based access
- NFR-2 Performance: search results within about 3 seconds under normal load
- NFR-3 Reliability: proper error handling and no data loss in normal use
- NFR-4 Usability: simple UI with validations and clear messages
- NFR-5 Maintainability: modular code and documented APIs
- NFR-6 Privacy: optional contact masking and report/moderation support



