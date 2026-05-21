import { AuthCard } from "@/components/auth-card";
import { RegisterForm } from "@/components/register-form";

export default function RegisterPage() {
  return (
    <AuthCard
      title="Đăng ký"
      description="Tạo tài khoản viewer hoặc streamer theo đúng API trong project plan."
      switchText="Đã có tài khoản?"
      switchHref="/login"
      switchLabel="Đăng nhập"
    >
      <RegisterForm />
    </AuthCard>
  );
}
