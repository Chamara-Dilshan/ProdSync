import { useEffect, useState } from "react"
import { User } from "firebase/auth"
import { onAuthChange } from "../shared/firebase/auth"
import Login from "./pages/Login"
import Generator from "./pages/Generator"

function App() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Listen to auth state changes
    const unsubscribe = onAuthChange((currentUser) => {
      setUser(currentUser)
      setLoading(false)
    })

    return () => unsubscribe()
  }, [])

  if (loading) {
    return (
      <div className="extension-popup flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="mb-4 flex items-center justify-center gap-0.5">
            <span className="text-2xl font-bold text-primary">Prod</span>
            <span className="text-2xl font-bold">Sync</span>
          </div>
          <div className="animate-spin h-6 w-6 border-4 border-primary border-t-transparent rounded-full mx-auto"></div>
          <p className="mt-3 text-xs text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return <Login />
  }

  return <Generator user={user} />
}

export default App
