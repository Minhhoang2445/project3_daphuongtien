import { AuthCard } from "@/components/auth-card";
import { LoginForm } from "@/components/login-form";

export default function LoginPage() {
  return (
    <AuthCard
      title="Dang nhap"
      description="Dang nhap de lay dashboard streamer, stream key va gui token vao cac API can bao ve."
      switchText="Chua co tai khoan?"
      switchHref="/register"
      switchLabel="Dang ky"
    >
      <LoginForm />
    </AuthCard>
  );
}
