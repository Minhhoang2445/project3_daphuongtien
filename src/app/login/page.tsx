import { AuthCard } from "@/components/auth-card";
import { LoginForm } from "@/components/login-form";

export default function LoginPage() {
  return (
    <AuthCard
      title="Đăng nhập"
      description="Đăng nhập để lấy dashboard streamer, Stream Key và gửi token vào các API cần bảo vệ."
      switchText="Chưa có tài khoản?"
      switchHref="/register"
      switchLabel="Đăng ký"
    >
      <LoginForm />
    </AuthCard>
  );
}
