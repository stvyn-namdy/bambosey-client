# Bambosey Development Setup

## Frontend Changes Summary

The frontend has been updated to connect to the external Bambosey backend API. Here are the key changes:

### 1. **API Configuration** (`src/lib/api.js`)

- Configured axios instance with backend base URL
- Added automatic token handling and refresh logic
- Centralized API endpoints

### 2. **Authentication Updates**

- Updated `AuthContext` to use backend `/auth/login`, `/auth/register`, `/logout` endpoints
- Changed from username to email-based authentication
- Added proper token storage and management
- Updated login/register pages to match backend API

### 3. **Product Management**

- Created `ProductsContext` to fetch products from backend
- Updated components to use backend product data
- Added fallback to local data when backend is unavailable
- Updated NewArrivals component to use ProductsContext

### 4. **Cart Integration**

- Updated `CartContext` to sync with backend cart API
- Added real-time cart operations (add, update, remove)
- Cart now persists across sessions when logged in

### 5. **Configuration Updates**

- Updated `.env.local` with backend API URL
- Modified `next.config.js` for development proxy (optional)

## Running the Application

### Prerequisites

1. Backend server running on `http://localhost:3300`
2. PostgreSQL database configured and seeded
3. Node.js and npm installed

### Start Frontend

```bash
cd client
npm install
npm run dev
```

### Start Backend (if not already running)

```bash
cd bambosey-backend
npm install
npm run dev
```

## Key Features Now Working

✅ **Authentication**: Login/Register with backend API
✅ **Product Display**: Products loaded from backend database
✅ **Cart Operations**: Add/remove items synced with backend
✅ **User Sessions**: Persistent login across browser sessions
✅ **Admin Access**: Role-based access control
✅ **Fallback Data**: Works offline with sample data

## API Endpoints Used

- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `POST /api/auth/logout` - User logout
- `GET /api/users/profile` - Get user profile
- `GET /api/products` - Get all products
- `GET /api/categories` - Get categories
- `GET /api/colors` - Get colors
- `GET /api/cart` - Get user cart
- `POST /api/cart/items` - Add item to cart
- `PUT /api/cart/items/:id` - Update cart item
- `DELETE /api/cart/items/:id` - Remove cart item

## Next Steps

1. Test all functionality with backend running
2. Add error handling for offline scenarios
3. Implement remaining features (orders, wishlist, reviews)
4. Add loading states and better UX feedback
5. Configure production environment variables
