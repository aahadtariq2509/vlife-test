# VLife Wrapper Frontend

A comprehensive Next.js 14 application built with modern web technologies for health, fitness, personal, professional, and work tracking. This frontend features authentication, dynamic dashboards, real-time data visualization, and a beautiful UI built with Tailwind CSS.

## 📋 Table of Contents

- [Overview](#overview)
- [Tech Stack](#tech-stack)
- [Features](#features)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Architecture](#architecture)
- [State Management](#state-management)
- [Authentication Flow](#authentication-flow)
- [API Integration](#api-integration)
- [UI Components](#ui-components)
- [Dashboard System](#dashboard-system)
- [Routing & Navigation](#routing--navigation)
- [Configuration](#configuration)
- [Development](#development)
- [Deployment](#deployment)
- [Contributing](#contributing)

## 🎯 Overview

VLife Wrapper Frontend is a Next.js 14 application that provides a comprehensive platform for tracking various aspects of life including health metrics, fitness activities, personal goals, professional development, and work management. The application features:

- **User Authentication** with JWT and OTP verification
- **Dynamic Dashboards** that can be configured per user
- **Data Visualization** with Chart.js
- **Responsive Design** with Tailwind CSS
- **State Management** with Redux Toolkit
- **Modern UI** with custom component library

## 🛠 Tech Stack

### Core Framework
- **Next.js 14** (App Router) - React framework with server-side rendering
- **React 18** - UI library
- **JavaScript (ES6+)** - Programming language

### State Management
- **Redux Toolkit** - Predictable state container
- **Redux Persist** - State persistence across sessions

### Styling & UI
- **Tailwind CSS** - Utility-first CSS framework
- **PostCSS** - CSS processing
- **Autoprefixer** - CSS vendor prefixes
- **Lucide React** - Icon library
- **Chart.js** - Data visualization
- **React Chart.js 2** - React wrapper for Chart.js

### Development Tools
- **ESLint** - Code linting
- **Jest** - Testing framework
- **Testing Library** - Component testing utilities

### Build & Deployment
- **AWS S3** - Static hosting
- **CloudFront** - CDN
- **Next.js Export** - Static site generation

## ✨ Features

### 🔐 Authentication System
- **JWT-based authentication** with access and refresh tokens
- **OTP verification** for enhanced security
- **Password reset flow** with email verification
- **Protected routes** with authentication guards
- **Session persistence** across browser sessions
- **Automatic token refresh** handling

### 📊 Dashboard System
- **Dynamic dashboards** configurable per user
- **Multiple dashboard views** (Fitness, Health, Personal, Professional, Work)
- **Customizable widgets** for different data types
- **Real-time data updates**
- **Drag-and-drop widget arrangement** (planned)

### 📈 Data Visualization
- **Line Charts** - Time series data
- **Bar Charts** - Comparative data
- **Pie Charts** - Proportional data
- **Progress Charts** - Goal tracking
- **Health Metric Cards** - Quick stats
- **Interactive tooltips** and legends

### 🎨 UI Components
Comprehensive component library including:
- **Button** - Multiple variants and sizes
- **Card** - Content containers
- **Input** - Text inputs with validation
- **TextArea** - Multi-line text input
- **Select** - Single and multi-select dropdowns
- **Modal** - Dialog windows
- **Toast** - Notification system
- **IconSlot** - Consistent icon placement

### 📱 Responsive Design
- **Mobile-first approach**
- **Breakpoints** for all screen sizes
- **Touch-friendly interactions**
- **Optimized performance** on mobile devices

### 🌗 Theme Support
- **Dark mode** support (planned)
- **CSS variables** for consistent theming
- **Customizable color schemes**

## 📁 Project Structure

```
vlifewrapperfrontend/
├── public/                          # Static assets
│   ├── images/                      # Images and illustrations
│   │   ├── avatars/                 # User avatars
│   │   ├── icons/                   # Custom icons
│   │   ├── illustrations/           # Graphics and illustrations
│   │   └── logos/                   # Brand logos
│   └── favicon.ico                  # Site favicon
│
├── src/
│   ├── app/                         # Next.js App Router
│   │   ├── login/                   # Login page
│   │   ├── register/                # Registration page
│   │   ├── dashboard/               # Main dashboard
│   │   ├── dashboards/              # Dashboard selection
│   │   ├── fitness/                 # Fitness tracking page
│   │   ├── health/                  # Health metrics page
│   │   ├── personal/                # Personal tracking page
│   │   ├── professional/            # Professional tracking page
│   │   ├── work/                    # Work tracking page
│   │   ├── settings/                # Settings page
│   │   ├── forgot-password/         # Password recovery
│   │   ├── reset-password/          # Password reset
│   │   ├── verification/            # OTP verification
│   │   ├── layout.js                # Root layout
│   │   ├── page.js                  # Home page (redirect logic)
│   │   └── globals.css              # Global styles
│   │
│   ├── components/                  # Reusable components
│   │   ├── auth/                    # Auth-specific components
│   │   ├── dashboard/               # Dashboard components
│   │   │   └── widgets/             # Dashboard widgets
│   │   ├── fitness/                 # Fitness components
│   │   ├── layout/                  # Layout components
│   │   │   ├── Header.jsx           # App header
│   │   │   ├── Footer.jsx           # App footer
│   │   │   ├── AuthenticatedLayout.jsx
│   │   │   └── ConditionalHeader.jsx
│   │   ├── providers/               # Context providers
│   │   └── ui/                      # UI component library
│   │       ├── Button/
│   │       ├── Card/
│   │       ├── Input/
│   │       ├── TextArea/
│   │       ├── SingleSelect/
│   │       ├── MultiSelect/
│   │       ├── Modal/
│   │       ├── Toast/
│   │       └── IconSlot/
│   │
│   ├── features/                    # Feature-based organization
│   │   ├── auth/                    # Authentication feature
│   │   │   ├── components/          # Auth components
│   │   │   │   ├── LoginScreen.jsx
│   │   │   │   ├── RegisterScreen.jsx
│   │   │   │   ├── VerificationScreen.jsx
│   │   │   │   ├── ForgotPasswordScreen.jsx
│   │   │   │   └── ResetPasswordScreen.jsx
│   │   │   ├── hooks/               # Custom hooks
│   │   │   │   └── useAuth.js       # Authentication hook
│   │   │   ├── withAuth.jsx         # HOC for auth
│   │   │   ├── withAuthGuard.jsx    # Route guard
│   │   │   └── server-auth.js       # Server-side auth
│   │   ├── theming/                 # Theme management
│   │   │   ├── colors.js
│   │   │   └── ThemeToggle.jsx
│   │   └── navigation/              # Navigation components
│   │       └── components/
│   │           ├── AppHeader.jsx
│   │           └── AppSidebar.jsx
│   │
│   ├── store/                       # Redux store
│   │   ├── slices/                  # Redux slices
│   │   │   └── authSlice.js         # Authentication state
│   │   ├── hooks.js                 # Redux hooks
│   │   └── index.js                 # Store configuration
│   │
│   ├── lib/                         # Utility libraries
│   │   ├── api.js                   # API client (legacy)
│   │   ├── api-client.js            # Universal API client
│   │   ├── dashboard-api.js         # Dashboard API client
│   │   ├── constants.js             # Constants
│   │   ├── utils.js                 # Utility functions
│   │   └── dashboard-utils.js       # Dashboard utilities
│   │
│   ├── config/                      # Configuration files
│   │   ├── site.js                  # Site configuration
│   │   ├── navigation.js            # Navigation config
│   │   └── environment.js           # Environment config
│   │
│   ├── hooks/                       # Global custom hooks
│   │   ├── useApi.js                # API hook
│   │   ├── useAuthErrorHandler.js   # Error handling hook
│   │   └── useLocalStorage.js       # LocalStorage hook
│   │
│   ├── data/                        # Static data and mockups
│   │   ├── fitness.json
│   │   ├── fitnessData.js
│   │   ├── sidebarMenu.json
│   │   └── testDashboardData.js
│   │
│   └── styles/                      # Global styles
│       └── color-variables.css      # CSS variables
│
├── .env.local                       # Local environment variables
├── .env.development                 # Development environment
├── .env.production                  # Production environment
├── next.config.js                   # Next.js configuration
├── tailwind.config.js               # Tailwind CSS configuration
├── postcss.config.js                # PostCSS configuration
├── package.json                     # Dependencies and scripts
├── deploy.sh                        # Deployment script
└── README.md                        # This file

```

## 🚀 Getting Started

### Prerequisites

- **Node.js** 18 or higher
- **npm** or **yarn** package manager
- **Git** for version control
- Backend API running (default: `http://localhost:3015`)

### Installation

1. **Clone the repository:**
   ```bash
   git clone <repository-url>
   cd vlifewrapperfrontend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up environment variables:**
   ```bash
   # Copy the example file
   cp env-examples.md .env.local
   
   # Edit .env.local with your configuration
   ```

4. **Start the development server:**
   ```bash
   npm run dev
   ```

5. **Open your browser:**
   Navigate to [http://localhost:3000](http://localhost:3000)

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run export` - Build and export static files
- `npm run deploy` - Deploy to AWS S3 (dev)
- `npm run deploy:staging` - Deploy to staging
- `npm run deploy:prod` - Deploy to production
- `npm run invalidate` - Invalidate CloudFront cache
- `npm run deploy:full` - Full production deployment

## 🏗 Architecture

### Application Flow

1. **User visits the application** → Root page (`page.js`) checks authentication
2. **If not authenticated** → Redirect to `/login`
3. **User logs in** → OTP verification required
4. **After verification** → User is authenticated and redirected to dashboards
5. **Dashboard selection** → User selects a dashboard type
6. **Dynamic dashboard loads** → Widgets render based on configuration

### Component Hierarchy

```
RootLayout
├── Providers (Redux, Theme, Toast)
│   ├── ConditionalHeader
│   │   └── Header (if authenticated)
│   ├── AuthenticatedLayout
│   │   ├── Sidebar Navigation (if authenticated)
│   │   └── Main Content (children)
│   └── Footer
```

## 🔄 State Management

### Redux Store Structure

```javascript
{
  auth: {
    user: null,                    // User object
    accessToken: null,             // JWT access token
    refreshToken: null,            // JWT refresh token
    isAuthenticated: false,        // Authentication status
    isLoading: false,              // Loading state
    error: null,                   // Error message
    pendingVerification: null,     // OTP verification pending
    resetToken: null              // Password reset token
  }
}
```

### Key Redux Actions

- `loginUser` - User login
- `registerUser` - User registration
- `verifyOTP` - OTP verification
- `logoutUser` - User logout
- `forgotPassword` - Initiate password reset
- `resetPassword` - Complete password reset
- `getProfile` - Fetch user profile
- `restoreAuthState` - Restore from localStorage

### Using Redux in Components

```javascript
import { useSelector, useDispatch } from 'react-redux';
import { useAuth } from '@/store/hooks';

function MyComponent() {
  const dispatch = useDispatch();
  const { user, isAuthenticated } = useAuth();
  
  // Access auth state
  const authState = useSelector(state => state.auth);
  
  // Dispatch actions
  dispatch(logoutUser());
  
  return <div>...</div>;
}
```

## 🔐 Authentication Flow

### 1. Login Flow

```
1. User enters credentials
2. Frontend sends POST /auth/login
3. Backend validates credentials
4. Backend returns accessToken + refreshToken
5. Frontend stores tokens in localStorage
6. If OTP required: Show verification screen
7. User enters OTP
8. Frontend sends POST /auth/verify-otp with token
9. Backend validates OTP
10. Frontend receives user data
11. User is authenticated and redirected
```

### 2. Registration Flow

```
1. User fills registration form
2. Frontend sends POST /auth/register
3. Backend creates user account
4. Backend sends OTP to user's email
5. Frontend stores tokens temporarily
6. User enters OTP on verification screen
7. Frontend sends POST /auth/verify-otp
8. Account is activated
9. User is authenticated
```

### 3. Password Reset Flow

```
1. User clicks "Forgot Password"
2. Frontend sends POST /auth/forgot-password
3. Backend sends OTP to email
4. User enters OTP on verification screen
5. Frontend sends POST /auth/verify-reset-otp
6. Backend validates OTP and returns reset token
7. User enters new password
8. Frontend sends POST /auth/reset-password
9. Password is updated
10. User is redirected to login
```

### Token Storage

- **Access Token**: Stored in `localStorage` with key `accessToken`
- **Refresh Token**: Stored in `localStorage` with key `refreshToken`
- **User Data**: Stored in `localStorage` with key `userData`
- Tokens are sent with every API request via `Authorization` header

### Authentication Guards

The application uses multiple authentication guards:

1. **Route Guards** - `withAuthGuard.jsx` HOC
2. **Component Guards** - `withAuth.jsx` HOC
3. **Manual Checks** - `useAuth()` hook
4. **Server-side** - `server-auth.js` utilities

## 🌐 API Integration

### API Client Architecture

The application uses a universal API client that works on both server and client:

```javascript
// Universal API client
import { api, apiAuth, apiClient } from '@/lib/api-client';

// Basic usage
const data = await api('/api/users', { method: 'GET' });

// Authenticated request
const profile = await apiAuth('/api/user/profile', { method: 'GET' });

// Convenience methods
const users = await apiClient.get('/api/users');
const newUser = await apiClient.post('/api/users', userData);
```

### API Configuration

Base URL configuration in `src/lib/constants.js`:

```javascript
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3015/api';
```

### Request Flow

1. **Request Preparation** - Add headers, tokens, body
2. **Fetch Request** - Send to backend API
3. **Response Handling** - Parse JSON response
4. **Error Handling** - Catch and handle errors
5. **State Update** - Update Redux store if needed

### Error Handling

```javascript
try {
  const response = await api('/api/endpoint');
  // Handle success
} catch (error) {
  if (error.message.includes('401')) {
    // Unauthorized - redirect to login
  } else if (error.message.includes('403')) {
    // Forbidden - show error
  } else {
    // Generic error handling
  }
}
```

## 🎨 UI Components

### Component Library Structure

All UI components are located in `src/components/ui/`:

#### Button Component

```javascript
import { Button } from '@/components/ui/Button';

<Button variant="primary" size="lg" onClick={handleClick}>
  Click Me
</Button>

// Variants: primary, secondary, outline, ghost, danger
// Sizes: sm, md, lg
```

#### Card Component

```javascript
import { Card } from '@/components/ui/Card';

<Card>
  <Card.Header>
    <h2>Title</h2>
  </Card.Header>
  <Card.Body>
    Content here
  </Card.Body>
</Card>
```

#### Input Component

```javascript
import { Input } from '@/components/ui/Input';

<Input
  type="text"
  placeholder="Enter name"
  value={name}
  onChange={(e) => setName(e.target.value)}
  error="Error message"
/>
```

#### Select Components

```javascript
import { SingleSelect } from '@/components/ui/SingleSelect';

<SingleSelect
  options={options}
  value={selected}
  onChange={setSelected}
  placeholder="Select option"
/>
```

### Dashboard Widgets

Located in `src/components/dashboard/widgets/`:

- **BarChartWidget** - Bar chart visualization
- **LineChartWidget** - Line chart for time series
- **PieChartWidget** - Pie chart for proportional data
- **ProgressChartWidget** - Progress indicators
- **HealthMetricCard** - Health metric display
- **HealthMetricsWidget** - Multiple health metrics

## 📊 Dashboard System

### Dashboard Configuration

Dashboards are dynamically loaded based on user configuration:

```javascript
// Dashboard types
- Fitness Dashboard (/fitness)
- Health Dashboard (/health)
- Personal Dashboard (/personal)
- Professional Dashboard (/professional)
- Work Dashboard (/work)
```

### Widget System

Widgets are registered and rendered dynamically:

```javascript
// Widget configuration
const widgetConfig = {
  type: 'bar-chart',
  title: 'Monthly Stats',
  data: [...],
  options: {...}
};

// Rendering
<WidgetRenderer config={widgetConfig} />
```

### Dynamic Dashboard Component

The `DynamicDashboard` component:
1. Fetches dashboard configuration from API
2. Renders appropriate widgets based on config
3. Handles data loading states
4. Manages widget interactions

## 🧭 Routing & Navigation

### App Router Structure

Next.js 14 App Router is used for routing:

```
app/
├── (root)
│   └── page.js              # Home (redirects based on auth)
├── login/                   # Login page
├── register/                # Registration page
├── dashboard/               # Main dashboard
├── dashboards/              # Dashboard selection
├── fitness/                 # Fitness tracking
├── health/                  # Health tracking
├── personal/                # Personal tracking
├── professional/            # Professional tracking
├── work/                    # Work tracking
├── settings/                # Settings
└── verification/            # OTP verification
```

### Navigation Configuration

Navigation is configured in `src/config/navigation.js`:

```javascript
export const navigationConfig = {
  main: [
    { name: 'Dashboard', href: '/dashboard', icon: 'Home' },
    { name: 'Analytics', href: '/analytics', icon: 'BarChart3' },
    // ...
  ]
};
```

### Protected Routes

Routes are protected using `withAuthGuard`:

```javascript
// In page.js
import { withAuthGuard } from '@/features/auth/withAuthGuard';

export default withAuthGuard(DashboardPage);
```

## ⚙️ Configuration

### Environment Variables

#### Required Variables

```env
NEXT_PUBLIC_API_URL=http://localhost:3015
NEXT_PUBLIC_BACKEND_API_URL=http://localhost:3015
NODE_ENV=development
```

#### Optional Variables

```env
NEXT_PUBLIC_ENABLE_ANALYTICS=false
NEXT_PUBLIC_ENABLE_DEBUG_MODE=true
```

See `env-examples.md` for complete configuration.

### Site Configuration

Site-wide settings in `src/config/site.js`:

```javascript
export const siteConfig = {
  name: 'VLife Wrapper',
  description: 'A modern Next.js application',
  url: 'https://vlifewrapper.com',
  // ...
};
```

### Tailwind Configuration

Custom Tailwind settings in `tailwind.config.js`:

- Custom colors
- Extended spacing
- Custom animations
- Box shadow presets
- Font families

## 💻 Development

### Code Style

- Use ESLint for code linting
- Follow Next.js best practices
- Use functional components with hooks
- Keep components small and focused

### Component Development

```javascript
// Component structure
export function MyComponent({ prop1, prop2 }) {
  // Hooks
  const [state, setState] = useState();
  const { data } = useAuth();
  
  // Effects
  useEffect(() => {
    // Side effects
  }, [dependencies]);
  
  // Handlers
  const handleClick = () => {
    // Handler logic
  };
  
  // Render
  return (
    <div>
      {/* JSX */}
    </div>
  );
}
```

### Adding New Features

1. Create feature folder in `src/features/`
2. Add components in `features/[name]/components/`
3. Add hooks in `features/[name]/hooks/`
4. Create Redux slice if needed
5. Add routes in `app/` directory
6. Update navigation config

### Testing

```bash
# Run tests
npm test

# Run tests in watch mode
npm test -- --watch

# Run tests with coverage
npm test -- --coverage
```

## 🚢 Deployment

### Build for Production

```bash
npm run build
```

This creates an optimized production build in `.next/` directory.

### Static Export

```bash
npm run export
```

This generates static HTML files in `out/` directory.

### Deploy to AWS S3

```bash
# Deploy to development
npm run deploy

# Deploy to staging
npm run deploy:staging

# Deploy to production
npm run deploy:prod

# Full production deployment (with cache invalidation)
npm run deploy:full
```

### Deployment Script

The `deploy.sh` script handles:
1. Building the application
2. Syncing to S3 bucket
3. Invaliding CloudFront cache
4. Cleaning up old files

### Environment-Specific Deployment

Create separate environment files:
- `.env.development` - Development server
- `.env.staging` - Staging server
- `.env.production` - Production server

## 🤝 Contributing

### Contributing Guidelines

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Write/update tests
5. Update documentation
6. Submit a pull request

### Code Review Process

1. All PRs must be reviewed
2. CI must pass
3. Code must follow style guide
4. Tests must pass
5. Documentation must be updated

## 📄 License

This project is licensed under the MIT License.

## 📞 Support

For support and questions:
- Create an issue on GitHub
- Contact the development team
- Check the documentation

## 🙏 Acknowledgments

Built with:
- [Next.js](https://nextjs.org/)
- [React](https://reactjs.org/)
- [Redux Toolkit](https://redux-toolkit.js.org/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Chart.js](https://www.chartjs.org/)
- [Lucide Icons](https://lucide.dev/)

---

Built with ❤️ using Next.js 14 and modern web technologies.
