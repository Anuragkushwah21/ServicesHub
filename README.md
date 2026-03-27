# ServiceHub - Service Booking Platform

A comprehensive full-stack service booking application built with Next.js 16, MongoDB, and NextAuth.js. Connect service providers with customers for a wide range of professional services.

## Features

### Core Features
- **Multi-role Authentication**: Support for users, vendors, and admins with secure JWT-based sessions
- **Service Browsing**: Browse and search services by category, price range, and keywords
- **Service Booking**: Book services with custom date and time selection
- **Payment System**: Secure payment processing with transaction tracking
- **Rating System**: Rate and review completed services
- **Analytics Dashboard**: Comprehensive admin dashboard with charts and metrics

### User Features
- Create and manage bookings
- View booking history and status
- Track spending and completed services
- Search and filter services

### Vendor Features
- Create and manage service listings
- View incoming bookings
- Update booking status (confirm/complete/cancel)
- Track revenue and customer analytics
- Monitor service ratings

### Admin Features
- Platform-wide analytics and statistics
- Revenue tracking by category and time period
- Booking status distribution
- User and vendor management
- System-wide insights

## Tech Stack

- **Frontend**: Next.js 16, React 19, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes, Node.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: NextAuth.js v5 with credentials provider
- **Charts**: Recharts for data visualization
- **UI Components**: shadcn/ui with Radix UI

## Project Structure

```
├── app/
│   ├── api/                    # API routes
│   │   ├── auth/              # Authentication endpoints
│   │   ├── services/          # Service management
│   │   ├── bookings/          # Booking operations
│   │   ├── payments/          # Payment processing
│   │   ├── vendor/            # Vendor-specific APIs
│   │   ├── admin/             # Admin analytics
│   │   └── categories/        # Category management
│   ├── admin/                 # Admin dashboard
│   ├── vendor/                # Vendor dashboard
│   ├── dashboard/             # User dashboard
│   ├── auth/                  # Authentication pages
│   ├── service/               # Service details page
│   ├── booking/               # Booking details & payment
│   ├── explore/               # Service browsing
│   └── page.tsx               # Landing page
├── components/
│   ├── navbar.tsx             # Navigation component
│   └── ui/                    # shadcn/ui components
├── lib/
│   ├── db.ts                  # Database connection
│   ├── auth.ts                # NextAuth configuration
│   ├── auth-utils.ts          # Auth utility functions
│   ├── api-response.ts        # API response helpers
│   └── models/                # Mongoose schemas
├── middleware.ts              # Route protection middleware
├── scripts/
│   └── seed.ts                # Database seeding script
└── package.json               # Dependencies

```

## Database Schema

### User
- Email (unique)
- Password (hashed with bcryptjs)
- Role (user, vendor, admin)
- Profile information (name, phone, city)

### Vendor
- Business name and description
- Verification status
- Rating and booking count
- Associated categories

### Service
- Name and description
- Price and duration
- Category
- Availability schedule
- Rating and booking count

### Booking
- Service, user, and vendor references
- Booking date and time
- Status (pending, confirmed, completed, cancelled)
- Notes and price

### Payment
- Booking reference
- Amount and status
- Payment method and transaction ID

### Category
- Name and description
- Icon and color for UI

## Getting Started

### Prerequisites
- Node.js 18+
- MongoDB database (local or cloud-based)
- pnpm package manager

### Installation

1. **Clone the repository** and install dependencies:
```bash
pnpm install
```

2. **Set up environment variables** in the Vars section of your v0 project settings:
```
MONGODB_URI=your_mongodb_connection_string
NEXTAUTH_SECRET=your_random_secret_key_here
```

3. **Seed the database** with demo data:
```bash
pnpm run seed
```

4. **Start the development server**:
```bash
pnpm run dev
```

Visit http://localhost:3000 to see your application.

## Demo Credentials

Test the application with these demo accounts:

### Regular User
- Email: `user@example.com`
- Password: `password123`

### Service Provider (Vendor)
- Email: `vendor@example.com`
- Password: `password123`

### Administrator
- Email: `admin@example.com`
- Password: `password123`

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/[...nextauth]` - NextAuth login/logout

### Services
- `GET /api/services` - Browse services
- `GET /api/services/[id]` - Get service details
- `POST /api/services` - Create service (vendor)

### Bookings
- `GET /api/bookings` - Get user bookings
- `POST /api/bookings` - Create booking
- `GET /api/bookings/[id]` - Get booking details
- `PATCH /api/bookings/[id]` - Update booking status

### Payments
- `POST /api/payments` - Process payment
- `GET /api/payments` - Get payment history

### Vendor APIs
- `GET /api/vendor/services` - Get vendor's services
- `POST /api/vendor/services` - Add new service
- `GET /api/vendor/bookings` - Get vendor's bookings
- `PATCH /api/vendor/bookings/[id]` - Update booking status

### Admin APIs
- `GET /api/admin/stats` - Get platform analytics

## Key Features Implementation

### Authentication & Authorization
- Session-based authentication with NextAuth.js
- JWT tokens stored in secure HTTP-only cookies
- Role-based access control via middleware
- Protected routes for user, vendor, and admin dashboards

### Database Management
- Mongoose schemas with type safety
- Database connection pooling
- Validation and error handling
- Seeding script for demo data

### API Architecture
- RESTful endpoints with consistent response format
- Error handling and validation middleware
- Role-based API access control
- Transaction IDs for payment tracking

### UI/UX
- Responsive design with Tailwind CSS
- Tab-based navigation for dashboards
- Real-time data updates
- Loading states and error handling
- Empty state illustrations

## Deployment

### To Vercel
1. Connect your GitHub repository to Vercel
2. Add environment variables (MONGODB_URI, NEXTAUTH_SECRET)
3. Deploy with automatic CI/CD

### To Other Platforms
1. Build the project: `pnpm run build`
2. Start production server: `pnpm run start`
3. Ensure environment variables are set

## Customization

### Adding New Categories
Edit `scripts/seed.ts` to add categories:
```typescript
const categories = [
  { name: "Your Category", description: "...", icon: "...", color: "..." },
  // ...
];
```

### Customizing Colors
Update Tailwind theme in `tailwind.config.ts` to match your brand.

### Payment Integration
Currently using mock payments. To integrate real payments:
1. Replace mock logic in `/app/api/payments/route.ts`
2. Integrate Stripe, PayPal, or other payment gateway
3. Update frontend payment form accordingly

## Security Considerations

- Passwords are hashed with bcryptjs (10 salt rounds)
- Environment variables for sensitive data
- Middleware for route protection
- Server-side validation of all inputs
- JWT-based session management
- CORS configured properly

## Performance Optimization

- Database query optimization with indexes
- Pagination support for listings
- Image optimization recommendations
- Caching strategies via HTTP headers
- Lazy loading for components

## Troubleshooting

### Database Connection Issues
- Verify MONGODB_URI is correct
- Check MongoDB is running (local) or accessible (cloud)
- Ensure network access is allowed

### Authentication Not Working
- Verify NEXTAUTH_SECRET is set
- Check cookies are enabled in browser
- Clear browser cache and cookies

### Payment Not Processing
- Verify all required fields in payment form
- Check console for error messages
- Ensure booking exists in database

## Future Enhancements

- Email notifications for bookings
- SMS reminders
- Real payment gateway integration
- Video consultations
- Advanced search filters
- Provider availability calendar
- Customer reviews and ratings
- Dispute resolution system
- Refund management
- Multi-language support

## License

MIT License - feel free to use this project for personal and commercial purposes.

## Support

For issues or questions, please refer to the documentation or create an issue in the repository.
