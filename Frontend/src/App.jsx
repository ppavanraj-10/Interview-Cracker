import { RouterProvider } from "react-router"
import { router } from "./app.routes.jsx"
import { AuthProvider } from "./features/auth/auth.context.jsx"
import { InterviewProvider } from "./features/interview/interview.context.jsx"
import { ThemeProvider, useTheme } from "./features/theme/theme.context.jsx"
import { useAuth } from "./features/auth/hooks/useAuth.js"

function AppContent() {
  const { isDark, toggleTheme } = useTheme()
  const { handleLogout } = useAuth()

  return (
    <div style={{ position: 'relative', minHeight: '100vh' }}>
      <div style={{ position: 'fixed', top: '1rem', right: '1rem', display: 'flex', gap: '0.75rem', zIndex: 1000 }}>
        <button
          onClick={toggleTheme}
          style={{
            width: '28px',
            height: '28px',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            padding: 0,
            display: 'grid',
            placeItems: 'center',
            color: '#ff2d78',
          }}
          aria-label="Toggle theme"
        >
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            {isDark ? (
              <>
                <circle cx="12" cy="12" r="5" />
                <line x1="12" y1="1" x2="12" y2="3" />
                <line x1="12" y1="21" x2="12" y2="23" />
                <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
                <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
                <line x1="1" y1="12" x2="3" y2="12" />
                <line x1="21" y1="12" x2="23" y2="12" />
                <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
                <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
              </>
            ) : (
              <path d="M17.5 12.5a5.5 5.5 0 1 1-6.99-6.99 7 7 0 1 0 6.99 6.99Z" />
            )}
          </svg>
        </button>
        <button
          onClick={handleLogout}
          style={{
            width: '28px',
            height: '28px',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            padding: 0,
            display: 'grid',
            placeItems: 'center',
            color: '#ff2d78',
          }}
          aria-label="Logout"
        >
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M16 17l5-5-5-5" />
            <path d="M21 12H9" />
            <path d="M9 5H5a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h4" />
          </svg>
        </button>
      </div>
      <RouterProvider router={router} />
    </div>
  )
}

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <InterviewProvider>
          <AppContent />
        </InterviewProvider>
      </AuthProvider>
    </ThemeProvider>
  )
}

export default App
