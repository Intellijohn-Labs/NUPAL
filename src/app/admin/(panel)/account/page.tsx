import { PageHeader } from "@/components/admin/PageHeader";
import { PasswordForm } from "@/components/admin/PasswordForm";

export default function AccountPage() {
  return (
    <>
      <PageHeader title="Change password" />
      <PasswordForm />
    </>
  );
}
