import { User } from "firebase/auth"
import { signOut } from "../../shared/firebase/auth"
import { Button } from "../../components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../components/ui/card"

interface GeneratorProps {
  user: User
}

export default function Generator({ user }: GeneratorProps) {
  const handleSignOut = async () => {
    try {
      await signOut()
    } catch (error) {
      console.error("Sign out error:", error)
    }
  }

  return (
    <div className="extension-popup bg-background p-4 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">
            Welcome, {user.displayName || user.email}
          </h2>
          <p className="text-sm text-muted-foreground">
            Reply generation coming soon
          </p>
        </div>
        <Button variant="ghost" size="sm" onClick={handleSignOut}>
          Sign Out
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Generate Reply</CardTitle>
          <CardDescription>
            AI-powered message generation for Etsy
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Reply generation UI coming in Phase 4. For now, you can test the
            authentication flow.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
