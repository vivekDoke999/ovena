# OVENA - Technical Architecture

## 1. Product Architecture
OVENA is a full-stack web application designed as an India-focused rental marketplace. It connects property owners (Hosts) directly with people looking for rental properties (Renters), eliminating middlemen where possible. The platform emphasizes a clean, premium, and professional user experience tailored to the Indian market.

### Core Modules
*   **Public Marketplace:** Search, map exploration, filtering, property details.
*   **Host Portal:** Property management, listing creation, enquiry management, analytics.
*   **Renter Portal:** Saved properties, enquiries, messaging.
*   **Admin Dashboard:** User/listing management, moderation, platform analytics.

## 2. Application Architecture
*   **Framework:** Next.js (App Router) for server-side rendering (SSR), static site generation (SSG), and API routes.
*   **Language:** TypeScript for type safety and scalability.
*   **Styling:** Tailwind CSS for a utility-first, modern, and clean design system. Custom UI components focused on accessibility and practical usage (no excessive glassmorphism or floating UI).
*   **State Management:** React Context API for global state, Zustand for complex client state (if needed), and React Query for server state management.
*   **Database ORM:** Prisma or Drizzle ORM.
*   **Map Integration:** Mapbox GL JS or Google Maps API for spatial search and property visualization.

## 3. Folder Structure
Based on Next.js App Router conventions:

```
/
├── src/
│   ├── app/                    # Next.js App Router pages
│   │   ├── (public)/           # Public routes (/, /rent, /properties, /map)
│   │   ├── (auth)/             # Authentication routes (/login, /signup)
│   │   ├── renter/             # Renter dashboard routes
│   │   ├── host/               # Host dashboard routes
│   │   ├── admin/              # Admin routes
│   │   ├── api/                # Backend API routes
│   │   └── layout.tsx          # Root layout
│   ├── components/             # Reusable UI components
│   │   ├── ui/                 # Core UI elements (buttons, inputs)
│   │   ├── properties/         # Property-specific components (cards, lists)
│   │   └── layout/             # Navigation, footer, sidebars
│   ├── lib/                    # Utility functions, database client, auth config
│   ├── types/                  # TypeScript interface definitions
│   └── hooks/                  # Custom React hooks
├── prisma/                     # Database schema and migrations
├── public/                     # Static assets (images, icons)
├── package.json
└── tailwind.config.ts
```

## 4. Database Architecture
*   **Database:** PostgreSQL (highly relational, supports PostGIS for location-based querying).
*   **Hosting:** Supabase or AWS RDS.

### Core Tables
*   `Users`
*   `Properties`
*   `Enquiries`
*   `Messages`
*   `SavedProperties`
*   `Reviews` (optional, for future)

## 5. Authentication Architecture
*   **Provider:** NextAuth.js (Auth.js) or Supabase Auth.
*   **Methods:** Email/Password, Phone Number (OTP) - crucial for the Indian market, and Google OAuth.
*   **Session Management:** JWT (JSON Web Tokens) or Server-side sessions via database.

## 6. User Roles
*   **Renter:** Can search, save, and enquire about properties.
*   **Host:** Can list properties, manage availability, and respond to enquiries. A Host can also act as a Renter.
*   **Admin:** Platform staff with access to moderation tools, user management, and system analytics.

## 7. Property Schema (Simplified)
```prisma
model Property {
  id                  String   @id @default(uuid())
  hostId              String
  title               String
  description         String   @db.Text
  category            Category // Enum: Apartment, House, Room, PG, etc.
  
  // Pricing
  rentAmount          Int
  depositAmount       Int
  maintenanceIncluded Boolean  @default(false)
  
  // Location
  address             String
  city                String
  locality            String
  state               String   @default("State")
  zipCode             String
  latitude            Float?
  longitude           Float?
  
  // Details
  bedrooms            Int?
  bathrooms           Int?
  furnishingStatus    Furnishing // Enum: Unfurnished, Semi, Fully
  carpetArea          Int?     // in sq.ft
  
  // Meta
  amenities           String[] // Array of amenity IDs or strings
  photos              String[] // Array of image URLs
  availabilityStatus  Status   // Enum: Available, Rented, Paused
  verificationStatus  VStatus  // Enum: Pending, Verified, Rejected
  
  createdAt           DateTime @default(now())
  updatedAt           DateTime @updatedAt
  
  // Relations
  host                User     @relation(fields: [hostId], references: [id])
  enquiries           Enquiry[]
}
```

## 8. Search Architecture
*   **Text Search:** Full-text search capabilities provided by PostgreSQL on fields like `title`, `locality`, and `city`.
*   **Filtering:** API endpoints supporting dynamic query parameters (e.g., `?city=Mumbai&minRent=10000&category=Apartment`).
*   **Pagination:** Cursor-based or offset-based pagination for performance on large datasets.

## 9. Map Architecture
*   **Geocoding:** Convert addresses entered by Hosts into Lat/Lng coordinates.
*   **Spatial Queries:** Use PostgreSQL + PostGIS (or Haversine formula for simpler setups) to query properties within a bounding box (visible map area) or a specific radius from a user's current location.
*   **Clustering:** Implement marker clustering on the frontend to handle dense property areas without performance degradation.

## 10. Host Listing Flow
1.  **Onboarding:** Create Host account / verify phone number.
2.  **Basic Details:** Property type, category, address.
3.  **Specifics:** Bedrooms, bathrooms, area, furnishing.
4.  **Pricing:** Rent, deposit, maintenance terms.
5.  **Media:** Upload high-quality photos (client-side compression before upload).
6.  **Review & Publish:** Preview listing, accept terms, publish (goes to 'Pending Verification' state).

## 11. Renter Flow
1.  **Discovery:** Land on homepage, search by city/locality or use "Near Me".
2.  **Exploration:** Toggle between List View and Map View. Apply filters (budget, type).
3.  **Detail View:** View photos, amenities, host details, and map location.
4.  **Action:** Save for later (requires login) or "Contact Host" / "Send Enquiry".
5.  **Management:** Track enquiry status in Renter Dashboard.

## 12. Admin Flow
1.  **Dashboard:** High-level metrics (new users, new listings, reported listings).
2.  **Moderation:** Queue of new properties requiring manual or automated verification.
3.  **User Management:** Ability to ban/suspend malicious actors.

## 13. Security Strategy
*   **Data Protection:** Row Level Security (RLS) if using Supabase, or strict API route validation ensuring users only access their own data.
*   **Input Validation:** Zod schema validation on both frontend forms and backend API routes.
*   **Rate Limiting:** Protect authentication and enquiry endpoints against brute-force and spam attacks.
*   **Sanitization:** Sanitize all user inputs to prevent XSS attacks.
*   **Image Uploads:** Restrict file types and sizes; use secure signed URLs for uploads to an S3-compatible storage.

## 14. Deployment Strategy
*   **Frontend & API:** Vercel (ideal for Next.js, offers built-in CI/CD, edge caching).
*   **Database:** Supabase (managed PostgreSQL) or AWS RDS.
*   **Storage:** AWS S3, Cloudflare R2, or Supabase Storage for property images.
*   **CI/CD:** GitHub Actions for running linting, type checking, and automated tests before allowing merges to the main branch.
