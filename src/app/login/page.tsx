import { AuthCard } from "@/components/auth-card";
import { LoginForm } from "@/components/login-form";

export default function LoginPage() {
  return (
    <AuthCard
      title="Đăng nhập"
      description="Tiếp tục vào dashboard streamer và quản lý phiên phát của bạn."
      switchText="Chưa có tài khoản?"
      switchHref="/register"
      switchLabel="Đăng ký"
    >
      <LoginForm />
    </AuthCard>
  );
}
