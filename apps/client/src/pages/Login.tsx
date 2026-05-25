import { Link } from "react-router"
import LoginForm from "@/components/LoginForm"

export default function Login() {
  return (
    <div style={{ maxWidth: 400, margin: "80px auto", padding: "0 16px" }}>
      <h1>Sign In</h1>
      <LoginForm />
      <p>
        No account? <Link to="/register">Register</Link>
      </p>
    </div>
  )
}
