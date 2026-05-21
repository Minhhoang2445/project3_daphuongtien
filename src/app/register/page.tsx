import { AuthCard } from "@/components/auth-card";
import { RegisterForm } from "@/components/register-form";

export default function RegisterPage() {
  return (
    <AuthCard
      title="Đăng ký"
      description="Tạo tài khoản viewer hoặc streamer để dùng trọn bộ trải nghiệm live."
      switchText="Đã có tài khoản?"
      switchHref="/login"
      switchLabel="Đăng nhập"
    >
      <RegisterForm />
    </AuthCard>
  );
}
