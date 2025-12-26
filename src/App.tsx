import Chat from './components/Chat'

// Read API key from environment variable (must be prefixed with VITE_ in .env)
const apiKey = import.meta.env.VITE_OPENAI_API_KEY || ''

function App() {
  if (!apiKey) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="text-center space-y-4">
          <p className="text-destructive font-medium">Missing API Key</p>
          <p className="text-muted-foreground text-sm">
            Please add <code className="bg-muted px-2 py-1 rounded">VITE_OPENAI_API_KEY=sk-...</code> to your .env file
          </p>
        </div>
      </div>
    )
  }

  return <Chat apiKey={apiKey} />
}

export default App
