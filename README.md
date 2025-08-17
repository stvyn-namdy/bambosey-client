# Bambosey

An e-commerce prototype built with Next.js and Tailwind CSS.

## Features

- **Public Storefront**

  - Full-screen hero banner, featured categories, and “New Arrivals” grid
  - Dynamic category pages with search + on-demand filter drawer (price, subcategory, color, size)
  - Product grid components with “Add to Cart” buttons

- **Authentication**

  - `/login` page with username/password + “Remember me”
  - JWT-based API routes under `/api/auth` (login, logout, current user)
  - `AuthContext` to expose `user`, `login()`, and `logout()` throughout the app
  - Header that toggles between “Log In” and “Hi, [user] / Log Out”

- **Shopping Cart**

  - `CartContext` managing `addItem`, `removeItem`, `updateQty`, and computed `total`
  - Header cart icon with badge showing item count
  - `CartDrawer` slide-out panel listing cart items, editable quantity inputs, subtotal, “View Cart” and “Checkout” actions
  - `/cart` page with full cart table, image, name, price, quantity controls, subtotal, grand total, and “Place Order” stub
  - Empty-cart state linking back to shopping

- **Admin Console**
  - Protected `/admin` area (requires `isAdmin` in JWT) with custom layout
  - **User Management**: `/admin/users` table with zebra striping, “Edit”/“Delete” actions (mock API)
  - **Order Management**: `/admin/orders` list with status badges and “View” action (mock API)
  - **AI Analytics**: `/admin/analytics` dashboard with bar and line charts powered by Recharts (mock data API)

## Getting Started

1. **Clone & install**
   git clone https://github.com/YourUsername/YourRepo.git
   cd YourRepo/client
   npm install
   # or
   yarn install

Add required packages

npm install axios date-fns recharts @types/recharts

# or

yarn add axios date-fns recharts @types/recharts

Set environment variables

Create client/.env.local with at least:
JWT_SECRET=your-secure-random-secret

Run the development server

npm run dev

# or

yarn dev
Open http://localhost:3000.

Test authentication

Log in as regular user:
Username: user  
Password: pass

Log in as admin:
Username: admin  
Password: pass

Explore
Browse products, add to cart, open the drawer or go to /cart.
As admin (/admin), manage users, orders, and view analytics.

Scripts
npm run dev — start development server

npm run build — build for production

npm start — run production build locally

npm run lint — run ESLint

npm run format — run Prettier

Learn More
Next.js Documentation
Tailwind CSS
Recharts
