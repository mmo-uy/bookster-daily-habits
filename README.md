# Bookster Habits Tracker 📱

A modern, offline-first habit tracking app built with React Native and Expo. Features robust API fallbacks, comprehensive testing, and a beautiful user interface. Uses a GitHub-hosted mock API server for instant development setup.

## ✨ Features

### 🎯 Core Functionality
- **Habit Creation & Management**: Add, edit, and delete habits with descriptions
- **Progress Tracking**: Mark habits as completed for specific dates
- **Day Filtering**: View habits by day of the week
- **Offline Support**: Full functionality without internet connection
- **Data Persistence**: Local storage with AsyncStorage

### 🔄 Advanced Features
- **Multi-Level API Fallbacks**: Primary API → Local Data → Free API → Empty State
- **Real-time Sync**: Automatic synchronization between local and remote data
- **Smart Data Merging**: Intelligent conflict resolution for offline/online scenarios
- **Comprehensive Testing**: Unit tests with Jest and React Native Testing Library
- **TypeScript**: Full type safety throughout the application

### 🎨 User Experience
- **Beautiful UI**: Modern design with themed components
- **Responsive Layout**: Optimized for mobile devices
- **Intuitive Navigation**: File-based routing with Expo Router
- **Loading States**: Smooth user feedback during operations
- **Error Handling**: Graceful error recovery with user-friendly messages

## 🚀 Getting Started

### Prerequisites
- Node.js (v18 or higher)
- **pnpm** (recommended package manager)
- Expo CLI: `npm install -g @expo/cli`

### 📦 Why pnpm over npm/yarn?

**pnpm** is chosen for this project because it offers significant advantages:

- **⚡ Performance**: Up to 3x faster than npm/yarn for installation
- **💾 Disk Efficiency**: Single storage location for packages (saves ~60% disk space)
- **🔒 Security**: Built-in package verification and integrity checks
- **🎯 Strict**: Prevents accidental dependencies and phantom dependencies
- **📊 Analytics**: Better dependency resolution and conflict detection

```bash
# Install pnpm globally
npm install -g pnpm

# Verify installation
pnpm --version
```

### 🛠️ Installation & Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd booksterhabits
   ```

2. **Install dependencies with pnpm**
   ```bash
   pnpm install
   ```

3. **Start the development server**
   ```bash
   pnpm start
   ```

   **That's it!** 🎉 The app automatically connects to the GitHub mock API server or falls back to local data.


### 📱 Running the App

Choose your preferred platform:

```bash
# Web browser (recommended for development)
pnpm run web

# Android emulator/device
pnpm run android

# iOS simulator (macOS only)
pnpm run ios

# Expo Go app
pnpm start  # Then scan QR code
```

## 🔌 API Configuration

The app uses a sophisticated fallback system for maximum reliability:

### Primary API (GitHub Mock Server)
The app connects to a mock REST API hosted on GitHub using [my-json-server](https://bookster-json-server.millstep.site):

```typescript
// services/api.ts
const API_BASE_URL = "https://bookster-json-server.millstep.site";
```


## 🧪 Testing

### Available Test Suites

```bash
# Run all tests
pnpm test

# Run tests in watch mode
pnpm run test:watch

# Run tests with coverage
pnpm run test:coverage
```

### Test Files
- **`context/__tests__/HabitsContext.test.tsx`**: Context and state management tests
- **`components/__tests__/DayFilter.test.tsx`**: Component interaction tests

### Test Coverage
- ✅ **Context Logic**: Habit creation, updates, deletion
- ✅ **State Management**: Reducer actions and state transitions
- ✅ **API Integration**: Mocked API calls and error handling
- ✅ **Component Behavior**: User interactions and UI updates
- ✅ **Fallback Systems**: Offline mode and error recovery

## 📁 Project Structure

```
booksterhabits/
├── app/                          # Main application (file-based routing)
│   ├── _layout.tsx              # Root layout
│   ├── (tabs)/                  # Tab navigation
│   │   ├── _layout.tsx
│   │   ├── index.tsx           # Home screen
│   │   └── stats.tsx           # Statistics screen
│   └── settings.tsx            # Settings screen
├── components/                  # Reusable UI components
│   ├── ui/                     # Base UI components
│   ├── HabitForm.tsx           # Habit creation form
│   ├── HabitItem.tsx           # Individual habit display
│   └── DayFilter.tsx           # Day selection filter
├── context/                     # React Context for state management
│   ├── HabitsContext.tsx       # Main habits context
│   └── __tests__/              # Context tests
├── services/                    # API and external services
│   └── api.ts                  # Centralized API service with fallbacks
├── types/                       # TypeScript type definitions
│   └── habits.ts               # Habit-related types
├── utils/                       # Utility functions
│   ├── date.ts                 # Date manipulation helpers
│   └── db.json                 # Local fallback data
├── constants/                   # App constants
│   ├── colors.ts               # Color scheme
│   └── theme.ts                # Theme configuration
└── hooks/                       # Custom React hooks
    └── use-color-scheme.ts     # Theme detection hook
```

## 📋 Available Scripts

```bash
# Development (Main)
pnpm start              # Start Expo development server
pnpm run web           # Start web development server
pnpm run android       # Start Android emulator
pnpm run ios           # Start iOS simulator

# API Server (Not Available - json-server not included)
# pnpm run server      # Would start json-server (not available in this project)
# pnpm run server:bg   # Would start server in background (not available)

# Combined Development (Not Available)
# pnpm run dev         # Would start both server and Expo app (not available)

# Testing
pnpm test              # Run all tests
pnpm run test:watch    # Run tests in watch mode

# Code Quality
pnpm run lint          # Run ESLint
pnpm run reset-project # Reset to fresh Expo project
```

## 🔧 Configuration

### Environment Variables
The API URL is configured directly in `services/api.ts`. For custom environments, you can modify:

```typescript
// In services/api.ts
const API_BASE_URL = "https://bookster-json-server.millstep.site";
```

### API Endpoints
The app connects to the following endpoints on the GitHub mock server:

- **GET** `https://bookster-json-server.millstep.site/habits` - Fetch all habits
- **POST** `https://bookster-json-server.millstep.site/habits` - Create new habit
- **PATCH** `https://bookster-json-server.millstep.site/habits/:id` - Update habit
- **DELETE** `https://bookster-json-server.millstep.site/habits/:id` - Delete habit

**Note**: The GitHub mock server provides realistic REST API behavior without requiring local setup.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Expo](https://expo.dev) - React Native framework
- [React Native](https://reactnative.dev) - Mobile development framework
- [TypeScript](https://www.typescriptlang.org) - Type safety
- [Jest](https://jestjs.io) - Testing framework
- [my-json-server](https://bookster-json-server.millstep.site) - API server

---

