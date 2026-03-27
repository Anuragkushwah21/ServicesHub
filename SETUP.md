# ServiceHub Setup Guide

Complete step-by-step setup instructions for the ServiceHub application.

## Quick Start (5 minutes)

### 1. Environment Setup
You'll need to configure two environment variables:

**MONGODB_URI**
- If using MongoDB Atlas (cloud): Get connection string from your cluster
- If using local MongoDB: `mongodb://localhost:27017/servicehub`
- Set this in your v0 project Vars section

**NEXTAUTH_SECRET**
- Generate a random secret: `openssl rand -base64 32`
- Set this in your v0 project Vars section

### 2. Install Dependencies
Dependencies are automatically installed when you push code. The application uses:
- Next.js 16 with React 19
- MongoDB with Mongoose
- NextAuth.js for authentication
- Tailwind CSS for styling
- Recharts for analytics

### 3. Seed Demo Data
The database comes pre-seeded with demo data including:
- 3 demo users (user, vendor, admin)
- 6 service categories
- 1 vendor profile with 3 services
- Sample bookings and payments

To reseed the database:
```bash
pnpm run seed
```

### 4. Start Development
```bash
pnpm run dev
```

Visit http://localhost:3000 and login with demo credentials below.

## Demo Accounts

### 1. User Account
Used for browsing and booking services
- **Email**: user@example.com
- **Password**: password123
- **Role**: Regular customer

### 2. Vendor Account
Used for managing services and bookings
- **Email**: vendor@example.com
- **Password**: password123
- **Role**: Service provider

### 3. Admin Account
Used for platform analytics and management
- **Email**: admin@example.com
- **Password**: password123
- **Role**: Administrator

## Key Workflows

### As a Customer (User)
1. Visit home page and click "Explore Services"
2. Browse available services or search by category
3. Click on a service to view details
4. Click "Book Service" to create a booking
5. Complete payment with test card details
6. View booking status in dashboard

### As a Service Provider (Vendor)
1. Login with vendor account
2. Go to Vendor Dashboard
3. Click "Add Service" to create new services
4. View incoming bookings in the Bookings tab
5. Confirm or complete bookings
6. Track revenue and ratings

### As an Administrator
1. Login with admin account
2. Access Admin Dashboard to view:
   - Total users, vendors, and bookings
   - Revenue analytics
   - Booking status distribution
   - Revenue trends by category

## Project Structure Explained

### Pages & Routes
- `/` - Landing page with service categories
- `/explore` - Service browsing and search
- `/service/[id]` - Service details and booking button
- `/auth/login` - User login
- `/auth/register` - New user registration
- `/dashboard` - User bookings and history
- `/vendor` - Vendor service management
- `/admin` - Platform analytics
- `/booking/[id]` - Booking details and payment

### API Routes
All API endpoints are in `/app/api/`

**Public Endpoints:**
- `POST /api/auth/register` - Registration
- `GET /api/services` - Browse services
- `GET /api/services/[id]` - Service details

**Protected Endpoints:**
- `GET /api/user/bookings` - User bookings
- `POST /api/bookings` - Create booking
- `POST /api/payments` - Process payment
- `GET /api/vendor/services` - Vendor's services
- `POST /api/vendor/services` - Add service
- `GET /api/admin/stats` - Platform analytics

## Database Schema

### Collections
1. **Users** - Authentication and profiles
2. **Vendors** - Business profiles
3. **Categories** - Service categories
4. **Services** - Individual services offered
5. **Bookings** - Service bookings
6. **Payments** - Payment transactions

All collections use MongoDB ObjectIds for relationships.

## Authentication Flow

1. User registers/logs in with email and password
2. Password is hashed with bcryptjs
3. NextAuth.js creates JWT token in HTTP-only cookie
4. Token is verified on protected routes via middleware
5. Role-based access control applied via middleware
6. Logout clears the cookie and session

## Customization Guide

### Change Service Categories
Edit `scripts/seed.ts`:
```typescript
const categories = [
  {
    name: "Your Category",
    description: "Description",
    icon: "emoji",
    color: "#HexColor",
  },
];
```

Run `pnpm run seed` to update.

### Change Branding
- Update app name in `components/navbar.tsx`
- Change colors in `tailwind.config.ts`
- Update metadata in `app/layout.tsx`
- Change demo prices in service creation

### Modify Dashboard Layouts
- User dashboard: `app/dashboard/page.tsx`
- Vendor dashboard: `app/vendor/page.tsx`
- Admin dashboard: `app/admin/page.tsx`

### Add New Features
1. Create database model in `lib/models/`
2. Create API route in `app/api/`
3. Create UI components in `components/`
4. Add page in `app/` if needed
5. Update middleware if adding protected routes

## Payment Testing

The app uses mock payments for testing. When making a payment:
- Enter any card number (validated format only)
- Any expiry date in future format
- Any 3-digit CVV
- Payment will be marked as successful

To integrate real payments:
1. Choose payment provider (Stripe, PayPal, etc.)
2. Install provider SDK: `pnpm add stripe` (example)
3. Update `/app/api/payments/route.ts`
4. Update payment form in `/app/booking/[id]/page.tsx`

## Performance Tips

1. **Database Indexing**
   - Add indexes to frequently queried fields
   - MongoDB Atlas creates indexes automatically

2. **Caching**
   - Implement Redis for session caching
   - Cache frequently accessed services

3. **Images**
   - Use Next.js Image component
   - Optimize images with compression

4. **API Optimization**
   - Use pagination for large datasets
   - Implement field selection in queries

## Deployment Checklist

Before deploying to production:
- [ ] Set MONGODB_URI and NEXTAUTH_SECRET
- [ ] Run production build: `pnpm run build`
- [ ] Test all features in production build
- [ ] Set up error logging/monitoring
- [ ] Configure CORS if needed
- [ ] Set up SSL/TLS certificates
- [ ] Enable HTTPS only
- [ ] Configure backup strategy
- [ ] Set up email notifications
- [ ] Create admin user account

## Troubleshooting

### Database connection fails
```
Error: Cannot connect to MongoDB
Solution: Check MONGODB_URI in environment variables
```

### 404 errors on API routes
```
Error: API route not found
Solution: Ensure API files are in /app/api/ with proper naming
```

### Authentication loops
```
Error: Redirects to login repeatedly
Solution: Check NEXTAUTH_SECRET is set and consistent
```

### Booking creation fails
```
Error: Cannot create booking
Solution: Ensure user is logged in and service exists
```

### Payment not processing
```
Error: Payment failed
Solution: Check all form fields are filled correctly
```

## Next Steps

1. **Customize for your business**
   - Add your logo
   - Update categories
   - Adjust pricing structure

2. **Add real features**
   - Integrate real payment gateway
   - Set up email notifications
   - Add file uploads for images

3. **Go live**
   - Deploy to Vercel
   - Set up domain
   - Configure monitoring

4. **Grow your platform**
   - Add more categories
   - Marketing campaigns
   - User incentives

## Support Resources

- MongoDB Docs: https://docs.mongodb.com/
- NextAuth Docs: https://next-auth.js.org/
- Next.js Docs: https://nextjs.org/docs
- Tailwind CSS: https://tailwindcss.com/docs
- Mongoose: https://mongoosejs.com/

## Production Deployment

### On Vercel
1. Push code to GitHub
2. Connect repository to Vercel
3. Add environment variables
4. Deploy

### On Other Platforms
1. Build: `pnpm run build`
2. Start: `pnpm run start`
3. Set environment variables
4. Monitor logs and errors

Enjoy building with ServiceHub!
