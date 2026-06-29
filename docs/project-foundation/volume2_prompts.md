# HomeHero - Volume 2: Product Design Prompt Book

This document compiles the master prompt engineering templates used to design, document, and map the product requirements for the **HomeHero** platform.

---

## 1. Product Requirement Document (PRD) Prompts

### Prompt 1.1: Comprehensive PRD Generation
```
Act as a Lead Product Manager for a MERN-based hyperlocal home services platform. Generate a comprehensive Product Requirement Document (PRD) covering the MVP launch phase.

Your document must include:
1. Executive Summary & Project Objectives.
2. User Personas (Customers, Technicians, Platform Admins).
3. Core Feature Requirements (Authentication, Booking, Payments, Telemetry, Review).
4. System Constraints, Key Performance Indicators (KPIs), and Performance Metrics.
```

---

## 2. User Stories Prompts

### Prompt 2.1: User Stories Compilation
```
You are a Product Owner and Business Analyst. Draft a set of structured Agile User Stories in the standard format ("As a..., I want..., So that...") for the following epics:
1. Booking Lifecycle (Creation, Matching, Checkin, Invoicing).
2. Payment Holds & Releases.
3. Live Location Tracking.
Ensure every user story includes detailed Acceptance Criteria using the Gherkin syntax ("Given... When... Then...").
```

---

## 3. User Journeys Prompts

### Prompt 3.1: Customer & Technician Mapping
```
Act as a Principal UX Architect. Design the step-by-step User Journeys for two main personas:
1. The Customer seeking an emergency plumber under a 15-minute response window.
2. The Technician receiving, accepting, and resolving a local dispatch job request.
Detail actions, emotional states, app screens, system events, and potential friction points at each stage.
```

---

## 4. Use Cases Prompts

### Prompt 4.1: UML Use Case Design
```
You are a Systems Analyst. Generate a use case specification document representing all primary interactions on the HomeHero platform. Define the Actors (Customer, Provider, Admin), the Use Cases (Book Service, Match Hero, Process Payment, Verify Profile), and write the happy paths, alternate flows, and pre/post conditions for each.
```

---

## 5. System Architecture Prompts

### Prompt 5.1: High-Level Design (HLD)
```
Act as a Cloud Enterprise Architect. Detail the High-Level System Architecture (HLD) for a MERN monorepo that supports real-time WebSocket telemetry and secure transactional payments.

Provide guidelines for:
1. Client-server communications (REST + Socket.io rooms).
2. Database isolation (Mongoose connection pool scaling).
3. External integrations layout (Cloudinary, Razorpay, Firebase).
4. Redundancy, server availability, and horizontal scaling strategies.
```

---

## 6. Low-Level Design (LLD) Prompts

### Prompt 6.1: Object Modeling & Class Diagram
```
You are a Principal Software Engineer. Draft the Low-Level Class Design (LLD) specifications for the HomeHero Backend Booking Dispatch Core. 

Provide detailed specifications for:
1. Schema Class structures (User, Technician, Booking, Payment).
2. Controller design patterns (singleton database connections, repository models).
3. Helper event hooks (Mongoose pre-save crypto hooks, transactional verification triggers).
4. Custom operational error handling interfaces.
```

---

## 7. UI/UX Planning Prompts

### Prompt 7.1: Flow Diagrams & Views
```
Act as a Senior Product Designer. Create a comprehensive UI/UX outline specifying the complete wireframe routing flow for the customer booking process, beginning at the category landing screen and concluding at the rating feedback submission page.
```

---

## 8. Wireframes Prompts

### Prompt 8.1: Component Layouts
```
Act as a UI/UX Wireframing Assistant. Detail the layout, layout grids, components structure, and form fields for the following critical screens:
1. Technician Real-time Dashboard (online toggle, incoming request cards, checklist updates).
2. Live Tracking Screen (Google map frame, ETA banner, chat popup).
```

---

## 9. Design System Prompts

### Prompt 9.1: Tailwind Design Tokens
```
You are a Design System Engineer. Generate a comprehensive design token stylesheet for the Tailwind CSS config file (`tailwind.config.js`) for HomeHero. Define the color palette (vibrant slate, deep indigos, neon green status indicators), font typography (Inter, Outfit), sizing scales, border-radius curves, and animations.
```

---

## 10. Branding & Logo Guidelines Prompts

### Prompt 10.1: Visual Brand Identity
```
Act as a Brand Director. Draft the Brand Identity Guidelines for HomeHero. Detail the company naming rationale, logo usage specifications (primary vertical, horizontal, icon lockup), spacing rules, typography hierarchy, logo color variations on dark/light backdrops, and corporate voice tones.
```
