import AuthLayout, { AuthFooterLink } from "@/components/AuthLayout"
import RegisterForm from "@/components/RegisterForm"

export default function Register() {
  return (
    <AuthLayout
      title="Create account"
      subtitle="Staff access for supply bin inventory and search"
      footer={
        <AuthFooterLink
          text="Have an account?"
          linkText="Sign in"
          to="/login"
        />
      }
    >
      <RegisterForm />
    </AuthLayout>
  )
}
