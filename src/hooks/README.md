# Custom Hooks

This directory contains custom React hooks for the application.

## useAuthErrorHandler

A custom hook for handling authentication errors consistently across the application.

### Usage

```javascript
import { useAuthErrorHandler } from '@/hooks/useAuthErrorHandler';

function MyComponent() {
  const { handleAuthError, withAuthErrorHandling } = useAuthErrorHandler();

  // Method 1: Manual error handling
  const handleApiCall = async () => {
    try {
      const result = await apiCall();
      return result;
    } catch (error) {
      const wasAuthError = await handleAuthError(error);
      if (!wasAuthError) {
        // Handle non-auth errors
        console.error('Other error:', error);
      }
    }
  };

  // Method 2: Automatic error handling wrapper
  const safeApiCall = withAuthErrorHandling(async () => {
    return await apiCall();
  });

  return (
    <div>
      <button onClick={handleApiCall}>Manual Error Handling</button>
      <button onClick={safeApiCall}>Automatic Error Handling</button>
    </div>
  );
}
```

### API

#### `handleAuthError(error, redirectTo?)`

Handles authentication errors by logging out the user and redirecting to the login page.

- **Parameters:**
  - `error` (Error): The error object to check
  - `redirectTo` (string, optional): Custom redirect path (defaults to '/login')
- **Returns:** `Promise<boolean>` - True if the error was handled as an auth error

#### `withAuthErrorHandling(asyncFn, redirectTo?)`

Wraps an async function to automatically handle authentication errors.

- **Parameters:**
  - `asyncFn` (Function): The async function to wrap
  - `redirectTo` (string, optional): Custom redirect path (defaults to '/login')
- **Returns:** `Function` - Wrapped function that handles auth errors

### Supported Error Types

The hook automatically detects and handles the following error patterns:
- Errors containing "401"
- Errors containing "unauthorized"
- Errors containing "403"
- Errors containing "forbidden"

### Example Integration

```javascript
// In a component that makes API calls
import { useAuthErrorHandler } from '@/hooks/useAuthErrorHandler';

function DashboardPage() {
  const { handleAuthError } = useAuthErrorHandler();
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const result = await api.get('/dashboard');
        setData(result);
      } catch (err) {
        const wasAuthError = await handleAuthError(err);
        if (!wasAuthError) {
          setError(err.message);
        }
      }
    };

    fetchData();
  }, []);

  // ... rest of component
}
```
