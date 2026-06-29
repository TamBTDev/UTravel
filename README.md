# UTravel

A full-stack online hotel booking web application built with a modern monorepo architecture. The system covers the complete booking lifecycle — from browsing hotels and selecting rooms to payment processing and booking management.

## UI Showcase

Here are the complete interface screenshots of the UTravel system:

<details>
<summary><b>1. Customer Interface</b></summary>
<br>

- **Homepage:**
<img src="https://raw.githubusercontent.com/buihaiduongdev/project-images/main/UTravel/homepage_1.png" width="800">
<img src="https://raw.githubusercontent.com/buihaiduongdev/project-images/main/UTravel/homepage_2.png" width="800">

- **Hotel Search:**
<img src="https://raw.githubusercontent.com/buihaiduongdev/project-images/main/UTravel/searchPage.png" width="800">

- **Hotel & Room Details:**
<img src="https://raw.githubusercontent.com/buihaiduongdev/project-images/main/UTravel/detail_1.png" width="800">
<img src="https://raw.githubusercontent.com/buihaiduongdev/project-images/main/UTravel/detail_2.png" width="800">
<img src="https://raw.githubusercontent.com/buihaiduongdev/project-images/main/UTravel/detail_3.png" width="800">

- **Checkout, Payment & Success:**
<img src="https://raw.githubusercontent.com/buihaiduongdev/project-images/main/UTravel/sumary.png" width="800">
<img src="https://raw.githubusercontent.com/buihaiduongdev/project-images/main/UTravel/payment.png" width="800">
<img src="https://raw.githubusercontent.com/buihaiduongdev/project-images/main/UTravel/trip_done.png" width="800">

- **My Trips & Reviews:**
<img src="https://raw.githubusercontent.com/buihaiduongdev/project-images/main/UTravel/mytrip.png" width="800">
<img src="https://raw.githubusercontent.com/buihaiduongdev/project-images/main/UTravel/trip_review.png" width="800">

- **Profile & Wishlist:**
<img src="https://raw.githubusercontent.com/buihaiduongdev/project-images/main/UTravel/profile.png" width="800">
<img src="https://raw.githubusercontent.com/buihaiduongdev/project-images/main/UTravel/wishlist.png" width="800">

- **Authentication (Login, Register & Forgot Password):**
<img src="https://raw.githubusercontent.com/buihaiduongdev/project-images/main/UTravel/login.jpg" width="800">
<img src="https://raw.githubusercontent.com/buihaiduongdev/project-images/main/UTravel/reg.jpg" width="800">
<img src="https://raw.githubusercontent.com/buihaiduongdev/project-images/main/UTravel/reg_otp.jpg" width="800">
<img src="https://raw.githubusercontent.com/buihaiduongdev/project-images/main/UTravel/forget.png" width="800">
<img src="https://raw.githubusercontent.com/buihaiduongdev/project-images/main/UTravel/forgetOTP.png" width="800">

</details>

<details>
<summary><b>2. Vendor Interface</b></summary>
<br>

- **Vendor Registration:**
<img src="https://raw.githubusercontent.com/buihaiduongdev/project-images/main/UTravel/vendor_reg.png" width="800">

- **Dashboard:**
<img src="https://raw.githubusercontent.com/buihaiduongdev/project-images/main/UTravel/vendor_dashboard.png" width="800">

- **Hotel & Room Management:**
<img src="https://raw.githubusercontent.com/buihaiduongdev/project-images/main/UTravel/vendor_hotels_room.png" width="800">

- **Order Management:**
<img src="https://raw.githubusercontent.com/buihaiduongdev/project-images/main/UTravel/vendor_order.png" width="800">

- **Revenue & Wallet:**
<img src="https://raw.githubusercontent.com/buihaiduongdev/project-images/main/UTravel/vendor_revenue.png" width="800">
<img src="https://raw.githubusercontent.com/buihaiduongdev/project-images/main/UTravel/wallet.png" width="800">

- **Vouchers & Promotions:**
<img src="https://raw.githubusercontent.com/buihaiduongdev/project-images/main/UTravel/vendor_voucher.png" width="800">

- **Reviews Management:**
<img src="https://raw.githubusercontent.com/buihaiduongdev/project-images/main/UTravel/vendor_cmt.png" width="800">

- **Vendor Settings:**
<img src="https://raw.githubusercontent.com/buihaiduongdev/project-images/main/UTravel/vendor-setting.png" width="800">

</details>

<details>
<summary><b>3. Admin Interface</b></summary>
<br>

- **Global System Dashboard:**
<img src="https://raw.githubusercontent.com/buihaiduongdev/project-images/main/UTravel/admin_dashboard.png" width="800">

- **User Management:**
<img src="https://raw.githubusercontent.com/buihaiduongdev/project-images/main/UTravel/admin_user.png" width="800">

- **Vendor Approval:**
<img src="https://raw.githubusercontent.com/buihaiduongdev/project-images/main/UTravel/admin_vendor.png" width="800">

- **Hotel Approval:**
<img src="https://raw.githubusercontent.com/buihaiduongdev/project-images/main/UTravel/admin_hotels.png" width="800">

- **Global Orders Management:**
<img src="https://raw.githubusercontent.com/buihaiduongdev/project-images/main/UTravel/admin_orders.png" width="800">

- **Global Revenue:**
<img src="https://raw.githubusercontent.com/buihaiduongdev/project-images/main/UTravel/admin_revenue.png" width="800">

- **Withdrawal Requests:**
<img src="https://raw.githubusercontent.com/buihaiduongdev/project-images/main/UTravel/admin_withdraw.png" width="800">

- **System Policies:**
<img src="https://raw.githubusercontent.com/buihaiduongdev/project-images/main/UTravel/admin_policies.png" width="800">

</details>

## Features

**Customer**
- Browse hotels by location, rating, and price; view room details and amenities
- Real-time room availability check
- Secure checkout with multiple payment options
- Booking history and account profile
- Loyalty program and membership tiers

**Staff / Admin**
- Hotel and room management
- Booking management with filtering and status updates
- Revenue and occupancy statistics dashboard
- Customer support dashboard

## Tech Stack

**Client** — React 19, TypeScript, Vite, Tailwind CSS v4, Mantine UI, TanStack Query, React Router v7, Zod, Axios

**Server** — Node.js, Express 5, TypeScript, MySQL / Prisma, JWT authentication, Nodemailer

**Shared** — Common Zod schemas and TypeScript types consumed by both client and server via path aliases in a `shared/` package

## Project Structure

```
UTravel/
├── client/     # React SPA
├── server/     # Express REST API
└── shared/     # Shared schemas, types, and constants
```

## Getting Started

**Prerequisites:** Docker and Docker Compose installed on your machine.

### Installation & Running (Docker)

The entire application (Frontend, Backend, and MySQL Database) is containerized and can be started with a single command.

1. **Start the application:**
```bash
docker compose up --build -d
```

2. **Access the services:**
- Frontend (React): [http://localhost:5173](http://localhost:5173)
- Backend API (Express): [http://localhost:3000](http://localhost:3000)
- Database (MySQL): Runs internally on port 3306

3. **Stop the application:**
```bash
docker compose down
```

### Environment Variables

Create `.env` file in `server/` folder:

```env
DATABASE_URL="mysql://user:password@localhost:3306/utravel_db"
JWT_SECRET="your-secret-key"
NODE_ENV="development"
PORT=3000
```

## Database

Uses MySQL with Prisma ORM for type-safe database operations.

## API Documentation

UTravel provides a comprehensive RESTful API built with Express. Below is the complete list of endpoints demonstrating the system's capabilities. For automated testing, you can download the [Postman Collection](./docs/UTravel_Postman_Collection.json).

### 1. Authentication (`/api/auth`)
| Method | Endpoint | Description | Access |
| :--- | :--- | :--- | :--- |
| `POST` | `/register` | Register a new account | Guest |
| `POST` | `/register/verify-otp` | Verify registration OTP | Guest |
| `POST` | `/register/resend-otp` | Resend registration OTP | Guest |
| `POST` | `/login` | Login and obtain JWT tokens | Guest |
| `POST` | `/forgot-password` | Request password reset (Send OTP) | Guest |
| `POST` | `/forgot-password/verify-otp`| Verify password reset OTP | Guest |
| `POST` | `/reset-password` | Set new password | Guest |
| `POST` | `/verify-token` | Validate JWT Token | Any |
| `POST` | `/refresh-token` | Issue new Access Token | Any |
| `POST` | `/logout` | Invalidate current session | Any |

### 2. Users (`/api/users`)
| Method | Endpoint | Description | Access |
| :--- | :--- | :--- | :--- |
| `GET` | `/profile` | Get current user profile | User |
| `PUT` | `/profile` | Update user profile | User |
| `GET` | `/favorites` | Get saved/favorite hotels | User |
| `POST` | `/favorites` | Toggle hotel favorite status | User |
| `GET` | `/viewed` | Get recently viewed hotels | User |
| `POST` | `/viewed` | Add hotel to recently viewed | User |
| `GET` | `/wallet` | Get digital wallet balance | User |
| `GET` | `/wallet/transactions` | Get wallet transaction history | User |

### 3. Hotels & Rooms (`/api/hotels`, `/api/rooms`)
| Method | Endpoint | Description | Access |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/hotels` | Search and filter hotels | Guest |
| `GET` | `/api/hotels/featured` | Get top-rated featured hotels | Guest |
| `GET` | `/api/hotels/destinations` | Get trending destinations | Guest |
| `GET` | `/api/hotels/:id` | Get detailed hotel information | Guest |
| `GET` | `/api/hotels/:id/related` | Get related/similar hotels | Guest |
| `GET` | `/api/rooms/:roomId` | Get detailed room information | Guest |
| `GET` | `/api/rooms/:roomId/availability`| Check room availability by date | Guest |

### 4. Bookings & Reviews (`/api/bookings`, `/api/reviews`)
| Method | Endpoint | Description | Access |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/bookings` | Create a new reservation | User |
| `GET` | `/api/bookings` | Get user booking history | User |
| `GET` | `/api/bookings/:id` | Get specific booking details | User |
| `PATCH` | `/api/bookings/:id` | Cancel or update booking status | User |
| `PATCH` | `/api/bookings/:id/complete` | Mark booking as completed | User |
| `GET` | `/api/bookings/validate-promo` | Validate and apply promo code | User |
| `GET` | `/api/reviews/hotel/:hotelId` | Get all reviews for a hotel | Guest |
| `POST` | `/api/reviews` | Submit a new review | User |

### 5. Payments (`/api/payments`)
| Method | Endpoint | Description | Access |
| :--- | :--- | :--- | :--- |
| `POST` | `/` | Initialize payment session | User |
| `GET` | `/:id` | Check payment transaction status | User |
| `GET` | `/booking/:bookingId` | Get payment info by booking ID | User |
| `POST` | `/sepay-webhook` | Handle SePay auto-confirmation | Webhook|

### 6. Vendor Dashboard (`/api/vendors`)
| Method | Endpoint | Description | Access |
| :--- | :--- | :--- | :--- |
| `POST` | `/register` | Register a new vendor account | User |
| `GET` | `/dashboard-stats` | Get vendor dashboard metrics | Vendor |
| `GET` | `/hotels` | Get vendor's properties | Vendor |
| `POST` | `/hotels` | Create a new property | Vendor |
| `PATCH` | `/hotels/:hotelId` | Update property details | Vendor |
| `GET` | `/hotels/:hotelId/rooms` | Get rooms for a specific property | Vendor |
| `POST` | `/hotels/:hotelId/rooms` | Add a new room type | Vendor |
| `PATCH` | `/hotels/:hotelId/rooms/:roomId`| Update room details & pricing | Vendor |
| `GET` | `/bookings` | Manage customer bookings | Vendor |
| `PATCH` | `/bookings/:id/status` | Update customer booking status | Vendor |
| `GET` | `/revenue-report` | Generate revenue charts & reports | Vendor |
| `GET` | `/reviews` | Manage customer reviews | Vendor |
| `PATCH` | `/reviews/:id/reply` | Reply to customer review | Vendor |
| `GET` | `/promotions` | Manage property promotions | Vendor |
| `POST` | `/promotions` | Create a new promotion code | Vendor |
| `GET` | `/wallet/withdraws` | View withdrawal history | Vendor |
| `POST` | `/wallet/withdraw` | Request revenue withdrawal | Vendor |

### 7. Administration (`/api/admin`)
| Method | Endpoint | Description | Access |
| :--- | :--- | :--- | :--- |
| `GET` | `/dashboard` | System-wide performance metrics | Admin |
| `GET` | `/users` | Get all registered users | Admin |
| `PATCH`| `/users/:id/status` | Ban or activate user account | Admin |
| `PATCH`| `/users/:id/role` | Manage user roles & permissions | Admin |
| `GET` | `/vendors/pending` | Get pending vendor registrations | Admin |
| `PATCH`| `/vendors/:id/status` | Approve or reject vendor account | Admin |
| `GET` | `/hotels` | Get all active properties | Admin |
| `GET` | `/hotels/pending` | Get pending property listings | Admin |
| `PATCH`| `/hotels/:id/status` | Approve or reject property listing | Admin |
| `PATCH`| `/hotels/:id/active` | Lock or unlock property visibility | Admin |
| `GET` | `/withdraw-requests` | Get all vendor withdrawal requests | Admin |
| `PATCH`| `/withdraw-requests/:id/approve`| Approve withdrawal request | Admin |
| `PATCH`| `/withdraw-requests/:id/reject` | Reject withdrawal request | Admin |
| `GET` | `/finance-report` | Platform financial & fee reports | Admin |

## License

ISC
