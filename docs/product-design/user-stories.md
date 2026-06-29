# HomeHero - Master User Stories Backlog

This document compiles the complete, prioritized Agile User Stories backlog for **HomeHero**, mapping customer, technician, and administrative operations.

---

## 1. Authentication Module (1–12)

| ID | Role | User Story | Priority |
| :--- | :--- | :--- | :--- |
| **US-001** | Customer | As a customer, I want to sign up with my mobile number so that I can easily create an account. | **Must-Have** |
| **US-002** | Customer | As a customer, I want to receive a 6-digit OTP code via SMS so that I can verify my phone number. | **Must-Have** |
| **US-003** | Customer | As a customer, I want to log in using JWT token sessions so that I stay logged in across app restarts. | **Must-Have** |
| **US-004** | Technician | As a technician, I want to register with my trade category (e.g. plumber) so that clients match with my skills. | **Must-Have** |
| **US-005** | Technician | As a technician, I want to upload my Aadhaar card so that my profile can be vetted by the admin team. | **Must-Have** |
| **US-006** | Admin | As an admin, I want to log in with secure credentials so that I can access the management panel. | **Must-Have** |
| **US-007** | Customer | As a customer, I want to register using Google OAuth so that I can sign up instantly without typing. | **Could-Have** |
| **US-008** | Customer | As a customer, I want to request a password reset email so that I can recover my account securely. | **Must-Have** |
| **US-009** | Customer | As a customer, I want to use face/fingerprint biometric login so that I can authenticate in 1 second. | **Could-Have** |
| **US-010** | Technician | As a technician, I want to receive account status alert emails so that I know when my profile is approved. | **Should-Have** |
| **US-011** | Customer | As a customer, I want to register my profile as corporate so that I can file expense receipts. | **Won't-Have** |
| **US-012** | All | As a user, I want to log out of the platform so that my session is terminated securely. | **Must-Have** |

---

## 2. Service Catalog Module (13–24)

| ID | Role | User Story | Priority |
| :--- | :--- | :--- | :--- |
| **US-013** | Customer | As a customer, I want to view active service categories so that I can select the correct handyman trade. | **Must-Have** |
| **US-014** | Customer | As a customer, I want to search for services by name (e.g. wiring) so that I find what I need quickly. | **Must-Have** |
| **US-015** | Customer | As a customer, I want to filter services by category slug so that my view is clean. | **Must-Have** |
| **US-016** | Customer | As a customer, I want to view standard hourly rates so that I know my baseline labor costs. | **Must-Have** |
| **US-017** | Customer | As a customer, I want to see pricing modifiers based on bedrooms/hours so that I get a realistic estimate. | **Must-Have** |
| **US-018** | Admin | As an admin, I want to create new services so that I can expand the catalog dynamically. | **Must-Have** |
| **US-019** | Admin | As an admin, I want to update service prices so that I can keep pricing aligned with inflation. | **Must-Have** |
| **US-020** | Admin | As an admin, I want to toggle service status (`isActive`) so that I can hide seasonal services. | **Must-Have** |
| **US-021** | Customer | As a customer, I want to see service pictures so that I can visually verify the repair type. | **Should-Have** |
| **US-022** | Customer | As a customer, I want to compare standard pricing packages so that I pick the most cost-effective deal. | **Could-Have** |
| **US-023** | Customer | As a customer, I want to book subscription packages for recurring repairs so that I get discounts. | **Won't-Have** |
| **US-024** | Customer | As a customer, I want to review diagnostic checklist guides so that I can troubleshoot small issues myself. | **Could-Have** |

---

## 3. Booking Module (25–38)

| ID | Role | User Story | Priority |
| :--- | :--- | :--- | :--- |
| **US-025** | Customer | As a customer, I want to book a service for a scheduled time so that I can plan my day. | **Must-Have** |
| **US-026** | Customer | As a customer, I want to cancel my booking so that I can reschedule if my plans change. | **Must-Have** |
| **US-027** | Technician | As a technician, I want to view pending job requests so that I can accept work. | **Must-Have** |
| **US-028** | Technician | As a technician, I want to reject a job request so that the system dispatches it to the next Hero. | **Must-Have** |
| **US-029** | Technician | As a technician, I want to update job status (e.g. en_route) so that the customer is informed. | **Must-Have** |
| **US-030** | Technician | As a technician, I want to request a start OTP from the customer so that I can verify I am at the correct house. | **Must-Have** |
| **US-031** | Technician | As a technician, I want to update the post-job checklist so that I can mark tasks as completed. | **Must-Have** |
| **US-032** | Customer | As a customer, I want to view my booking history so that I can track past transactions. | **Must-Have** |
| **US-033** | Customer | As a customer, I want to add custom booking notes so that I can detail the repair issue. | **Should-Have** |
| **US-034** | Technician | As a technician, I want to upload before/after photos so that I can prove the work was completed correctly. | **Should-Have** |
| **US-035** | Customer | As a customer, I want to reschedule a pending booking so that I can accommodate sudden events. | **Should-Have** |
| **US-036** | Admin | As an admin, I want to view active dispatches on a map so that I can monitor platform operations. | **Could-Have** |
| **US-037** | Customer | As a customer, I want to book recurring weekly cleanings so that I don't have to book manually every week. | **Won't-Have** |
| **US-038** | Technician | As a technician, I want to delegate a booking to a teammate so that I can balance my workload. | **Won't-Have** |

---

## 4. Payments Module (39–50)

| ID | Role | User Story | Priority |
| :--- | :--- | :--- | :--- |
| **US-039** | Customer | As a customer, I want to pay via Razorpay checkout so that my payment is secured. | **Must-Have** |
| **US-040** | Customer | As a customer, I want my payment held in escrow so that I only pay once the job is completed. | **Must-Have** |
| **US-041** | Technician | As a technician, I want my earnings released to my wallet upon job completion. | **Must-Have** |
| **US-042** | Customer | As a customer, I want to download my invoice PDF so that I have a receipt for my records. | **Must-Have** |
| **US-043** | Customer | As a customer, I want a refund if my booking is cancelled before matching. | **Must-Have** |
| **US-044** | Technician | As a technician, I want to view my payout history so that I can track my earnings. | **Must-Have** |
| **US-045** | Admin | As an admin, I want to manually release escrow funds in a dispute so that I can resolve issues. | **Must-Have** |
| **US-046** | Customer | As a customer, I want to pay with credit card installments (EMI) so that I can afford larger repairs. | **Could-Have** |
| **US-047** | Technician | As a technician, I want to withdraw my wallet balance directly via UPI. | **Should-Have** |
| **US-048** | Customer | As a customer, I want to pay with local offline cash so that I don't need a credit card. | **Won't-Have** |
| **US-049** | Customer | As a customer, I want to split bills with housemates directly in the app. | **Could-Have** |
| **US-050** | Admin | As an admin, I want to view transaction audits so that I can compile financial reports. | **Must-Have** |

---

## 5. Notifications Module (51–62)

| ID | Role | User Story | Priority |
| :--- | :--- | :--- | :--- |
| **US-051** | Customer | As a customer, I want to receive an app push notification when a technician accepts my booking. | **Must-Have** |
| **US-052** | Technician | As a technician, I want to receive a push notification for new jobs nearby so that I don't miss work. | **Must-Have** |
| **US-053** | Customer | As a customer, I want to receive an SMS when the technician is en route so that I can prepare. | **Should-Have** |
| **US-054** | Customer | As a customer, I want to receive an email receipt when my payment is confirmed. | **Should-Have** |
| **US-055** | Technician | As a technician, I want to receive an SMS alert if my wallet withdrawal fails. | **Should-Have** |
| **US-056** | Customer | As a customer, I want to receive a push alert when a job status changes to active. | **Must-Have** |
| **US-057** | Customer | As a customer, I want to receive a marketing email with discount offers to save money on future services. | **Could-Have** |
| **US-058** | Technician | As a technician, I want to toggle SMS notifications so that I can control my mobile data usage. | **Could-Have** |
| **US-059** | Customer | As a customer, I want to receive automated voice calls (IVR) when a technician arrives at my gate. | **Won't-Have** |
| **US-060** | Customer | As a customer, I want to receive weekly service summaries so that I can track my household maintenance. | **Could-Have** |
| **US-061** | All | As a user, I want to toggle push alerts in settings so that I can control notifications. | **Should-Have** |
| **US-062** | Admin | As an admin, I want to send system-wide notifications so that I can announce updates. | **Must-Have** |

---

## 6. Review & Rating Module (63–74)

| ID | Role | User Story | Priority |
| :--- | :--- | :--- | :--- |
| **US-063** | Customer | As a customer, I want to submit a 1-5 star rating for completed bookings. | **Must-Have** |
| **US-064** | Customer | As a customer, I want to write review comments so that I can share my experience. | **Must-Have** |
| **US-065** | Customer | As a customer, I want to upload repair photos with my review so that I can show the work quality. | **Should-Have** |
| **US-066** | Technician | As a technician, I want to view customer reviews on my profile so that I can build credibility. | **Must-Have** |
| **US-067** | Customer | As a customer, I want to see technician average ratings so that I can pick the best Hero. | **Must-Have** |
| **US-068** | Admin | As an admin, I want to flag inappropriate reviews so that I can keep the platform fair. | **Must-Have** |
| **US-069** | Customer | As a customer, I want to edit my review within 24 hours of submission in case I made a mistake. | **Should-Have** |
| **US-070** | Technician | As a technician, I want to reply to customer reviews so that I can clarify disputes. | **Should-Have** |
| **US-071** | Customer | As a customer, I want to tip technicians directly inside the rating flow. | **Could-Have** |
| **US-072** | Customer | As a customer, I want to share technician reviews on social media. | **Won't-Have** |
| **US-073** | Customer | As a customer, I want to filter technician reviews by rating count. | **Could-Have** |
| **US-074** | Admin | As an admin, I want to remove reviews that violate policy. | **Must-Have** |

---

## 7. User Profile Module (75–84)

| ID | Role | User Story | Priority |
| :--- | :--- | :--- | :--- |
| **US-075** | Customer | As a customer, I want to update my first name, last name, and profile details. | **Must-Have** |
| **US-076** | All | As a user, I want to upload a profile photo so that other users can recognize me. | **Must-Have** |
| **US-077** | Customer | As a customer, I want to save multiple addresses so that I can checkout faster. | **Must-Have** |
| **US-078** | Customer | As a customer, I want to mark a default address so that it auto-selects during checkout. | **Must-Have** |
| **US-079** | Technician | As a technician, I want to update my bio so that customers know my expertise. | **Must-Have** |
| **US-080** | Technician | As a technician, I want to select my active skills so that the system dispatches correct jobs. | **Must-Have** |
| **US-081** | Technician | As a technician, I want to update my availability schedule (days, hours) to manage my time. | **Must-Have** |
| **US-082** | Customer | As a customer, I want to save my corporate GSTIN details so that I can file tax claims. | **Could-Have** |
| **US-083** | All | As a user, I want to delete my account so that my private data is removed from the system. | **Should-Have** |
| **US-084** | Technician | As a technician, I want to upload professional certifications to my profile to build trust. | **Could-Have** |

---

## 8. Dashboard Module (85–92)

| ID | Role | User Story | Priority |
| :--- | :--- | :--- | :--- |
| **US-085** | Customer | As a customer, I want to view my active bookings on my home screen so that I can track their status. | **Must-Have** |
| **US-086** | Technician | As a technician, I want a dashboard that displays my current online/offline status. | **Must-Have** |
| **US-087** | Technician | As a technician, I want to view my total weekly earnings on my dashboard to track my income. | **Must-Have** |
| **US-088** | Technician | As a technician, I want to view my average rating on my dashboard to monitor my performance. | **Must-Have** |
| **US-089** | Customer | As a customer, I want to see trending services on my home screen so that I can discover new options. | **Should-Have** |
| **US-090** | Technician | As a technician, I want to see high-demand surge areas on my map dashboard to find more jobs. | **Could-Have** |
| **US-091** | Customer | As a customer, I want to see my carbon footprint savings on my dashboard when choosing eco-friendly options. | **Won't-Have** |
| **US-092** | Technician | As a technician, I want to see my lifetime booking counts on my dashboard to celebrate milestones. | **Could-Have** |

---

## 9. Admin Control Module (93–100)

| ID | Role | User Story | Priority |
| :--- | :--- | :--- | :--- |
| **US-093** | Admin | As an admin, I want to view the list of pending technician verification requests. | **Must-Have** |
| **US-094** | Admin | As an admin, I want to verify a technician's Aadhaar and status so that they can accept jobs. | **Must-Have** |
| **US-095** | Admin | As an admin, I want to suspend a user account so that I can enforce safety rules. | **Must-Have** |
| **US-096** | Admin | As an admin, I want to view all user profiles in the system to manage accounts. | **Must-Have** |
| **US-097** | Admin | As an admin, I want to view active surge multipliers so that I can monitor pricing adjustments. | **Must-Have** |
| **US-098** | Admin | As an admin, I want to update surge multipliers so that I can respond to high demand. | **Must-Have** |
| **US-099** | Admin | As an admin, I want to export transaction reports to CSV so that I can run financial audits. | **Must-Have** |
| **US-100** | Admin | As an admin, I want to configure the platform commission rate so that I can manage margins. | **Won't-Have** |
