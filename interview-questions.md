# Technical Interview Questions: Bookster Daily Habits Project

Based on the analysis of the "Bookster Daily Habits" React Native app, here are potential technical interview questions and their detailed answers.

## React Native & Expo Fundamentals

### 1. Expo Router Navigation
**Question:** How does the app handle navigation between screens? Explain the role of `expo-router` in the `_layout.tsx` file and how it differs from traditional React Navigation setup.

**Answer:** The app uses Expo Router for file-based routing. In `_layout.tsx`, the `Stack` component from `expo-router` manages navigation with screens defined by file structure (e.g., `(tabs)/index.tsx` for the main tab). Unlike traditional React Navigation, Expo Router automatically generates routes from the file system, reducing boilerplate. The `unstable_settings` with `anchor: "(tabs)"` sets the default tab group. This approach is more declarative and integrates seamlessly with Expo's build system.

### 2. Platform-Specific Code
**Question:** The app uses `react-native-reanimated` for animations. How would you handle platform differences (iOS vs Android) for gesture-based interactions in a component like `HabitItem`?

**Answer:** For platform differences, use `Platform.OS` from React Native. For example, in `HabitItem.tsx`, wrap gesture handlers with `Platform.select()` or conditional logic. iOS might use different haptic feedback or animation curves. Reanimated's `withSpring` can be configured per platform using `Platform.select({ ios: { damping: 15 }, android: { damping: 20 } })` to match native feel.

### 3. Expo Configuration
**Question:** Looking at `app.json`, what does `"newArchEnabled": true` mean, and what are the implications for the app's performance and compatibility?

**Answer:** `"newArchEnabled": true` enables React Native's New Architecture, which includes the TurboModules and Fabric renderer. This improves performance through better JS-native bridge communication and more efficient rendering. Implications include better startup times, smoother animations, and future-proofing, but requires careful testing as it's still evolving and may have compatibility issues with some third-party libraries.

## State Management & Context API

### 4. useReducer Pattern
**Question:** In `HabitsContext.tsx`, why is `useReducer` used instead of `useState` for managing habits and progress? What are the benefits of this approach for complex state updates?

**Answer:** `useReducer` is used for complex state logic with multiple related updates. Benefits include predictable state transitions through actions, easier testing of reducer logic, and better performance for deep state updates. In this case, actions like "TOGGLE_HABIT" handle both progress tracking and habit completion logic in one place, making the code more maintainable than multiple `useState` calls.

### 5. Context Provider Structure
**Question:** How does the `HabitsProvider` handle both local storage (AsyncStorage) and API synchronization? Explain the `mergeHabitsData` function and its role in data consistency.

**Answer:** The provider loads data from AsyncStorage first, then fetches from API and merges using `mergeHabitsData`. This function creates a Map of API habits for O(1) lookups, combines server and local data, and marks local-only habits with `_isLocal: true`. This ensures offline functionality while syncing when online, preventing data loss and maintaining consistency through unique IDs.

### 6. Custom Hook Design
**Question:** The `useHabits` hook throws an error if used outside the provider. What pattern is this following, and why is it important for type safety in TypeScript?

**Answer:** This follows the "Provider Pattern" with runtime checks. The error prevents usage outside the context, ensuring the hook always has access to state. In TypeScript, the `HabitsContextType | undefined` union forces proper provider wrapping. This pattern catches configuration errors early and provides clear error messages, improving developer experience and preventing runtime crashes.

## TypeScript & Type Safety

### 7. Type Definitions
**Question:** Looking at the types in `types/habits.ts` (referenced in the context), how do the `LocalHabit` and `Habit` types differ? How does this affect the API integration logic?

**Answer:** `LocalHabit` extends `Habit` with `_isLocal: boolean` for tracking origin. This affects API logic by allowing conditional operations: local habits use AsyncStorage, server habits use API calls. The merge function uses this flag to decide whether to sync with server or keep local-only, ensuring data integrity during offline/online transitions.

### 8. Action Types
**Question:** In the reducer, actions are defined as a union type. How does TypeScript ensure type safety when dispatching actions, and what would happen if you tried to dispatch an invalid action?

**Answer:** TypeScript's discriminated unions ensure type safety by requiring exact action shapes. The `type` field discriminates actions, so dispatching an invalid action (wrong `type` or missing `payload`) causes a compile-time error. At runtime, the `default` case in the reducer throws or ignores invalid actions, preventing state corruption.

## Asynchronous Operations & Data Persistence

### 9. AsyncStorage Integration
**Question:** How does the app persist data locally? Explain the `loadData` and `saveData` functions in `HabitsContext.tsx` and potential race conditions.

**Answer:** Data persists via AsyncStorage with JSON serialization. `loadData` reads "habits" and "progress" keys on app start, `saveData` writes on state changes. Potential race conditions occur during rapid updates; mitigated by `useEffect` dependency on `state.loading` to avoid saving during loads. The `finally` block ensures loading state resets even on errors.

### 10. API Error Handling
**Question:** The `loadData` function has fallback logic when the API fails. What strategies are used for offline-first functionality, and how does it handle data conflicts between local and server state?

**Answer:** Offline-first uses AsyncStorage as primary store, API as sync layer. On API failure, falls back to local data. Conflicts resolved by prioritizing server data during merges, with local changes preserved via `_isLocal` flag. The `refreshHabits` function allows manual sync, ensuring users can recover from network issues.

### 11. Optimistic Updates
**Question:** In the `toggleHabit` function, changes are applied immediately to local state. How would you implement optimistic updates for API operations like `addHabit` or `editHabit`?

**Answer:** For optimistic updates, apply changes immediately to local state, then attempt API call. On success, update with server response; on failure, revert local changes and show error. In `addHabit`, create local habit first, then replace with server-created habit on success. Use a temporary ID (like UUID) that gets replaced by server ID.

## Component Design & Performance

### 12. Animated Components
**Question:** In `HabitItem.tsx`, `react-native-reanimated` is used for scale and opacity animations. How do shared values (`useSharedValue`) work, and what are the performance benefits over traditional React animations?

**Answer:** `useSharedValue` creates values that persist across re-renders and can be animated on the UI thread. They work by storing values in shared memory accessible to both JS and native threads. Benefits include 60fps animations without blocking JS thread, smoother interactions, and better performance on low-end devices compared to `Animated` library.

### 13. Memoization
**Question:** The component uses `useRef` to track previous completion state. When would you use `React.memo` or `useMemo` in this component, and what impact would it have on re-renders?

**Answer:** Use `React.memo` to prevent re-renders when props haven't changed, especially for lists. `useMemo` for expensive calculations like date formatting. Impact: reduces unnecessary renders, improving performance in long lists. However, over-memoization can hurt performance, so profile first.

### 14. Touchable Areas
**Question:** The component uses `hitSlop` for touch targets. Why is this important for mobile UX, and how does it relate to accessibility guidelines?

**Answer:** `hitSlop` expands touchable area beyond visual bounds, improving usability on small screens or with finger navigation. Accessibility guidelines (WCAG) recommend minimum 44x44pt touch targets. This ensures better accessibility for users with motor impairments and follows iOS/Android design guidelines for touch-friendly interfaces.

## Hooks & Effects

### 15. useEffect Dependencies
**Question:** In `HabitsContext.tsx`, there are multiple `useEffect` hooks. Explain the dependency arrays and why `saveData` is called conditionally based on `state.loading`.

**Answer:** One `useEffect` with empty `[]` loads data on mount. Another with `[state.habits, state.progress]` saves on changes. Conditional save prevents overwriting during loads, avoiding race conditions. Dependencies ensure effects run only when necessary, optimizing performance and preventing infinite loops.

### 16. Custom Hooks
**Question:** The app uses `useColorScheme` from a custom hook. How would you implement a similar hook for detecting network connectivity, and how would it integrate with the existing context?

**Answer:** Create `useNetworkStatus` using `NetInfo` from `@react-native-community/netinfo`. It would return `isConnected` and `type`. Integrate by adding to context state, updating via `useEffect` with `NetInfo.addEventListener`. This allows components to react to connectivity changes, enabling features like auto-sync when coming online.

## Testing & Code Quality

### 17. Testing Strategy
**Question:** The project includes Jest and `@testing-library/react-native`. How would you test the `HabitsContext` reducer logic, and what challenges arise when testing async operations?

**Answer:** Test reducer by passing initial state and actions, asserting new state. Mock API calls for async tests. Challenges: timing issues with async operations, mocking AsyncStorage, ensuring test isolation. Use `act()` for state updates, mock timers for delays.

### 18. Error Boundaries
**Question:** The context doesn't currently use error boundaries. How would you implement one to handle potential crashes in the habit management logic?

**Answer:** Wrap `HabitsProvider` in an `ErrorBoundary` component using `componentDidCatch` or `getDerivedStateFromError`. On error, show fallback UI and log to error reporting service. For context-specific errors, add try-catch in reducer actions and dispatch error actions to show user-friendly messages.

## Advanced Topics

### 19. Performance Optimization
**Question:** How would you optimize the performance of a list rendering many `HabitItem` components? Consider memory usage, rendering efficiency, and user experience.

**Answer:** Use `FlatList` with `keyExtractor` for efficient recycling. Implement `React.memo` on `HabitItem` to prevent unnecessary re-renders. Use `useMemo` for expensive computations. For animations, leverage `react-native-reanimated`'s worklets to run on UI thread. Implement virtualization with `initialNumToRender` and `maxToRenderPerBatch`. Profile with Flipper or React DevTools to identify bottlenecks.

### 20. Security Considerations
**Question:** What security measures would you implement for data stored in AsyncStorage and API communications in this habit-tracking app?

**Answer:** For AsyncStorage, encrypt sensitive data using libraries like `react-native-keychain` or `expo-secure-store`. Implement proper authentication with JWT tokens. Use HTTPS for all API calls. Validate input data on both client and server. Implement rate limiting and CSRF protection. For offline data, consider encrypting the entire storage or using secure enclaves on supported devices.

### 21. Code Splitting and Bundle Optimization
**Question:** How would you implement code splitting in this Expo Router-based app to reduce the initial bundle size?

**Answer:** Use dynamic imports with `React.lazy()` for route-based splitting. Expo Router supports automatic code splitting per route. Implement lazy loading for heavy libraries like charts in the stats screen. Use `expo-updates` for over-the-air updates to deliver smaller incremental bundles. Analyze bundle with `expo bundle-analyzer` and optimize by tree-shaking unused dependencies.

### 22. Advanced Animations and Gestures
**Question:** How would you implement a swipe-to-delete gesture on `HabitItem` using `react-native-gesture-handler` and `react-native-reanimated`?

**Answer:** Use `PanGestureHandler` to detect swipe gestures. Create animated values for translation and opacity. Implement threshold-based deletion with haptic feedback. Use `runOnJS` to trigger state updates from worklets. Add spring animations for smooth interactions. Consider accessibility by providing alternative delete methods.

### 23. Internationalization (i18n)
**Question:** How would you add multi-language support to this app, considering both static text and dynamic content?

**Answer:** Use `react-i18next` or `expo-localization`. Create translation files for each language. Wrap the app with `I18nProvider`. Use `useTranslation` hook in components. For dates and numbers, use `Intl` API or libraries like `date-fns`. Handle RTL languages with `I18nManager`. Store user language preference in AsyncStorage.

### 24. CI/CD Pipeline
**Question:** Design a CI/CD pipeline for this React Native app using EAS Build and GitHub Actions.

**Answer:** Use GitHub Actions with EAS Build for fastlane-free builds. Configure workflows for build on PR, test on push. Use EAS Update for OTA updates. Implement automated testing with Jest. Add code quality checks with ESLint and Prettier. Use TestFlight for iOS beta distribution, Google Play Beta for Android.

## Live Coding Session Improvements

In a 30-minute live coding session, interviewers might ask for the following improvements to assess your practical skills:

### 1. Add a New Feature (10-15 min)
- **Task:** Implement a "streak counter" that shows how many consecutive days a habit has been completed.
- **Why:** Tests component composition, state management integration, and UI updates.
- **Expected:** Add logic to calculate streaks in the context, display in HabitItem, handle edge cases like missed days.

### 2. Performance Optimization (10 min)
- **Task:** Optimize the habits list rendering when there are many habits.
- **Why:** Evaluates understanding of React performance patterns in mobile apps.
- **Expected:** Implement `React.memo`, `useMemo`, and potentially `FlatList` optimizations.

### 3. Bug Fix (5-10 min)
- **Task:** Fix a potential race condition in the data loading or a UI bug in animations.
- **Why:** Tests debugging skills and attention to detail.
- **Expected:** Identify the issue, propose a fix, and implement it correctly.

### 4. Accessibility Improvement (5 min)
- **Task:** Add proper accessibility labels and hints to interactive elements.
- **Why:** Assesses awareness of mobile accessibility standards.
- **Expected:** Use `accessibilityLabel`, `accessibilityHint`, and test with screen readers.

### 5. Testing Addition (5-10 min)
- **Task:** Write a unit test for a specific function or component.
- **Why:** Evaluates testing knowledge and ability to write maintainable tests.
- **Expected:** Mock dependencies, test edge cases, use appropriate testing utilities.

### 6. Refactoring (10 min)
- **Task:** Refactor a complex component or hook to improve readability and maintainability.
- **Why:** Tests code organization and best practices.
- **Expected:** Extract functions, improve naming, add proper TypeScript types.

### General Tips for Live Coding:
- Start by understanding the existing code structure.
- Ask clarifying questions if needed.
- Explain your thought process while coding.
- Focus on clean, readable code over complex features.
- Test your changes as you go.
- Be prepared to discuss trade-offs and alternative approaches.