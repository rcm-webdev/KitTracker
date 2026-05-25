import { Link } from "react-router"
import RegisterForm from "@/components/RegisterForm"

export default function Register() {
  return (
    <div style={{ maxWidth: 400, margin: "80px auto", padding: "0 16px" }}>
      <h1>Create Account</h1>
      <RegisterForm />
      <p>
        Have an account? <Link to="/login">Sign In</Link>
      </p>
    </div>
  )
}
