# TST - Expo React Native App

A full-featured mobile application built with Expo and React Native, featuring authentication, app management, subscription handling, and push notifications.

## 📋 Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Architecture](#architecture)
- [Project Structure](#project-structure)
- [How It Works](#how-it-works)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Running the Project](#running-the-project)
- [Building for Production](#building-for-production)
- [Key Components](#key-components)

## ✨ Features

- **Authentication System**
  - Sign in / Sign up functionality
  - Password recovery
  - Biometric authentication (Face ID / Fingerprint)
  - Secure token storage with Expo SecureStore
  - Auto-login with stored credentials

- **App Management**
  - Create and manage multiple apps
  - Image upload for app icons
  - Form validation with Yup schemas
  - App dashboard with tabs navigation

- **Subscription Management**
  - Multiple subscription plans
  - Billing cycle toggle (Monthly/Yearly)
  - Payment processing
  - Billing history
  - Subscription status tracking
  - Feature comparison

- **Push Notifications**
  - Firebase Cloud Messaging integration
  - Local notifications with Notifee
  - Push notification permissions handling

- **Modern UI/UX**
  - Dark mode support
  - Tab-based navigation

## 🛠 Tech Stack

### Core
- **Expo** (~53.0.27) - React Native development platform
- **React** (19.0.0) - UI library
- **React Native** (0.79.6) - Mobile framework
- **TypeScript** (~5.8.3) - Type safety

### Navigation
- **Expo Router** (~5.1.11) - File-based routing

### State Management
- **Redux Toolkit** (^2.11.2) - Global state management
- **React Redux** (^9.2.0) - React bindings for Redux

### Forms & Validation
- **React Hook Form** (^7.72.0) - Form management
- **Yup** (^1.7.1) - Schema validation
- **@hookform/resolvers** (^5.2.2) - Validation resolver

### API & Data
- **Apisauce** (^3.2.2) - Axios wrapper for API calls
- **DummyJSON** - Demo API endpoint

### Authentication & Security
- **Expo SecureStore** (^55.0.9) - Secure token storage
- **Expo Local Authentication** (~16.0.5) - Biometric authentication

### Push Notifications
- **@react-native-firebase/app** (^23.8.8) - Firebase SDK
- **@react-native-firebase/messaging** (^23.8.8) - Push notifications
- **@notifee/react-native** (^9.1.8) - Local notifications

### Other Features
- **Expo Image Picker** (~16.1.4) - Image selection
- **React Native Reanimated** (~3.17.4) - Animations

## 🏗 Architecture

The application follows a clean architecture pattern with clear separation of concerns:

```
┌─────────────────┐
│   App Router    │  ← File-based navigation
└────────┬────────┘
         │
┌────────▼────────┐
│   Containers    │  ← Business logic & state
│   (Layouts)     │
└────────┬────────┘
         │
┌────────▼────────┐
│   Components    │  ← Presentation layer
└────────┬────────┘
         │
┌────────▼────────┐
│  Redux Store    │  ← Global state management
└────────┬────────┘
         │
┌────────▼────────┐
│    Services     │  ← API calls & external services
└─────────────────┘
```

## 📁 Project Structure

```
tst/
├── app/                        # Expo Router - File-based routing
│   ├── _layout.tsx             # Root layout
│   ├── index.tsx               # Entry point (redirects based on auth)
│   ├── (auth)/                 # Authentication screens
│   │   ├── sign-in.tsx
│   │   ├── sign-up.tsx
│   │   └── forgot-password.tsx
│   ├── (app)/                  # Main app screens (authenticated)
│   │   ├── app-form.tsx
│   │   ├── modal.tsx
│   │   └── (tabs)/             # Tab navigation
│   └── subscription/           # Subscription management
│       ├── index.tsx
│       ├── plans.tsx
│       ├── payment.tsx
│       ├── detail.tsx
│       └── billing-history.tsx
│
├── components/                 # Reusable UI components
│   ├── AppCard.tsx
│   ├── AuthWrapper.tsx
│   ├── BiometricSettingsCard.tsx
│   ├── ControlledInput.tsx
│   └── subscription/           # Subscription-specific components
│
├── layouts/                    # Container components (business logic)
│   ├── sign-in/
│   │   └── useSignInContainer.ts
│   ├── sign-up/
│   ├── app-management/
│   ├── subscription-tab/
│   └── ...
│
├── store/                      # Redux store
│   ├── index.ts
│   ├── hooks.ts
│   └── slices/
│       ├── authSlice.ts        # Authentication state
│       ├── appsSlice.ts        # Apps CRUD state
│       └── subscriptionSlice.ts # Subscription state
│
├── services/                   # External services
│   ├── api.ts                  # API service layer
│   ├── pushNotificationService.ts
│   ├── usePushNotifications.ts
│   └── mockSubscriptionAPI.ts
│
├── types/                      # TypeScript type definitions
│   ├── auth.ts
│   ├── app.ts
│   └── subscription.ts
│
├── validation/                 # Yup validation schemas
│   ├── authSchemas.ts
│   └── appSchemas.ts
│
├── utils/                      # Utility functions
│   └── biometricAuth.ts
│
├── hooks/                      # Custom React hooks
│   ├── useSubscription.ts
│   ├── usePayment.ts
│   └── useDebounce.ts
│
├── constants/                  # App constants
│   └── Colors.ts
│
└── android/                    # Native Android code
    └── app/
        └── google-services.json # Firebase configuration
```

## 🔄 How It Works

### 1. Application Flow

```
App Launch
    │
    ▼
Load Stored Auth (SecureStore)
    │
    ├─► Not Authenticated ───► Sign In Screen
    │                              │
    │                              ▼
    │                          Login Form
    │                              │
    │                              ▼
    │                       Optional Biometric
    │                              │
    └─► Authenticated ◄────────────┘
            │
            ▼
    Dashboard (Tabs)
    ├─► Apps Management
    ├─► Profile/Settings
    └─► Subscription
```

### 2. Authentication Flow

The authentication system uses **Redux Toolkit** with async thunks for state management:

1. **Sign In:**
   - User enters credentials in [sign-in.tsx](app/(auth)/sign-in.tsx)
   - Form validated with Yup schema
   - `loginUser` thunk dispatched to [authSlice.ts](store/slices/authSlice.ts)
   - API call to DummyJSON via [api.ts](services/api.ts)
   - On success: Token stored in **Expo SecureStore**
   - User redirected to main app

2. **Auto Login:**
   - On app start, `loadStoredAuth` thunk checks SecureStore
   - If valid token exists, user is logged in automatically
   - Otherwise, redirected to sign-in

3. **Biometric Authentication:**
   - Available after first successful login
   - Uses Expo Local Authentication API
   - Stores encrypted credentials in SecureStore
   - Face ID / Fingerprint for quick access

### 3. State Management

**Redux Store Structure:**

```typescript
{
  auth: {
    user: User | null,
    isAuthenticated: boolean,
    loading: boolean,
    error: string | null
  },
  apps: {
    items: App[],
    isLoading: boolean,
    error: string | null
  },
  subscription: {
    currentSubscription: Subscription | null,
    plans: Plan[],
    billingHistory: Transaction[],
    isLoading: boolean
  }
}
```

### 4. Navigation System

The app uses **Expo Router** with file-based routing:

- **/(auth)** - Authentication group (public)
- **(app)** - Main app group (protected)
- **(tabs)** - Tab navigation within main app
- **subscription/** - Subscription management screens

Route protection is handled by checking `isAuthenticated` state in [index.tsx](app/index.tsx).

### 5. Subscription Management

```
Plans Screen
    │
    ▼
Select Plan
    │
    ▼
Choose Billing Cycle (Monthly/Yearly)
    │
    ▼
Payment Screen
    │
    ▼
Process Payment (Mock API)
    │
    ▼
Update Redux State
    │
    ▼
Show Subscription Details
```

The subscription state is managed in [subscriptionSlice.ts](store/slices/subscriptionSlice.ts) with mock API calls in [mockSubscriptionAPI.ts](services/mockSubscriptionAPI.ts).

### 6. Push Notifications

Push notifications are configured using:
- **Firebase Cloud Messaging (FCM)** for remote notifications
- **Notifee** for local notifications and enhanced Android notifications

Flow:
1. Request permission on app launch
2. Register device with FCM
3. Retrieve FCM token
4. Store token for backend integration
5. Listen for incoming messages
6. Display notifications via Notifee

Service: [pushNotificationService.ts](services/pushNotificationService.ts)

### 7. Form Handling

Forms use **React Hook Form** + **Yup** validation:

```typescript
// Define schema
const schema = yup.object({
  email: yup.string().email().required(),
  password: yup.string().min(6).required()
});

// Use in component
const { control, handleSubmit } = useForm({
  resolver: yupResolver(schema)
});

// Controlled input component
<ControlledInput
  control={control}
  name="email"
  placeholder="Email"
/>
```

### 8. API Integration

API calls are centralized in [api.ts](services/api.ts) using **Apisauce**:

```typescript
const api = create({
  baseURL: 'https://dummyjson.com',
  headers: { 'Content-Type': 'application/json' }
});

export const authService = {
  login: async (credentials) => {
    const response = await api.post('/auth/login', credentials);
    return response.data;
  }
};
```

### 9. Container Pattern

Business logic is separated into container hooks (in `layouts/` folder):

```typescript
// useSignInContainer.ts
export const useSignInContainer = () => {
  const dispatch = useAppDispatch();
  const { loading, error } = useAppSelector(state => state.auth);
  
  const handleSignIn = async (data) => {
    await dispatch(loginUser(data));
  };
  
  return { handleSignIn, loading, error };
};
```

Components remain presentational and receive data/callbacks from containers.

## 📋 Prerequisites

- **Node.js** (v16 or higher)
- **npm** or **yarn**
- **Expo CLI**
- **Android Studio** (for Android development)
- **Xcode** (for iOS development, macOS only)

## 📥 Installation

1. **Clone the repository:**
   ```bash
   git clone <repository-url>
   cd tst
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Install push notification dependencies (optional):**

   On Windows:
   ```bash
   ./install-push-notifications.bat
   ```

   On macOS/Linux:
   ```bash
   ./install-push-notifications.sh
   ```

4. **Configure Firebase (for push notifications):**
   - Place your `google-services.json` in `android/app/`
   - Configure iOS Firebase settings if targeting iOS

## 🚀 Running the Project

### Development Mode

Start the Expo development server:
```bash
npm start
```

This will open Expo Dev Tools in your browser.

### Run on Android

```bash
npm run android
```

Or manually:
```bash
cd android
./gradlew assembleDebug
```

### Run on iOS (macOS only)

```bash
npm run ios
```

### Run on Web

```bash
npm run web
```

## 📦 Building for Production

### Android Release Build

```bash
cd android
./gradlew assembleRelease
```

The APK will be generated at:
```
android/app/build/outputs/apk/release/app-release.apk
```

### iOS Release Build

Use EAS Build or Xcode:
```bash
eas build --platform ios
```

## 🔑 Key Components

### Core Components

- **AuthWrapper** - Handles authentication check and loading state
- **ControlledInput** - Reusable form input with React Hook Form
- **AppCard** - Displays app information in dashboard
- **BiometricSettingsCard** - Biometric authentication toggle

### Subscription Components

- **PlanCard** - Displays subscription plan details
- **SubscriptionButton** - CTA button for subscription actions
- **BillingCycleToggle** - Monthly/Yearly toggle
- **FeatureList** - Lists plan features
- **StatusBadge** - Shows subscription status
- **LoadingSkeleton** - Loading placeholders

### Custom Hooks

- **useSubscription** - Subscription state and actions
- **usePayment** - Payment processing logic
- **useDebounce** - Debounced value updates
- **usePushNotifications** - Push notification setup

## 🔐 Environment & Configuration

### API Configuration

Default API endpoint is set in [api.ts](services/api.ts):
```typescript
const API_BASE_URL = 'https://dummyjson.com';
```

For production, replace with your actual API endpoint.

### Demo Credentials (DummyJSON)

For testing authentication:
- Username: `emilys`
- Password: `emilyspass`

## 🧪 Testing

Run tests:
```bash
npm test
```

The project uses **Jest** with **jest-expo** preset.

## 📱 Supported Platforms

- ✅ Android
- ✅ iOS
- ✅ Web

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

## 📄 License

This project is private and proprietary.

## 📞 Support

For issues or questions, please open an issue in the repository.

---

**Built with ❤️ using Expo and React Native**
