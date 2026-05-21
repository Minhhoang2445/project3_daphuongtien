import { AuthCard } from "@/components/auth-card";
import { RegisterForm } from "@/components/register-form";

export default function RegisterPage() {
  return (
    <AuthCard
      title="Dang ky"
      description="Tao tai khoan viewer hoac streamer theo dung API trong project plan."
      switchText="Da co tai khoan?"
      switchHref="/login"
      switchLabel="Dang nhap"
    >
      <RegisterForm />
    </AuthCard>
  );
}
