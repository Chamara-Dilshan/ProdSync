import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { SignupForm } from "@/components/auth/SignupForm"

export default function SignupPage(): JSX.Element {
  return (
    <Card>
      <CardHeader className="text-center">
        <CardTitle className="text-2xl font-bold">
          <span className="text-primary">Prod</span>Sync
        </CardTitle>
        <CardDescription>Create an account to get started</CardDescription>
      </CardHeader>
      <CardContent>
        <SignupForm />
      </CardContent>
    </Card>
  )
}
