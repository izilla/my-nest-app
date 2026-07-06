import { createFileRoute } from '@tanstack/react-router';
import { VerifyEmail as VerifyEmailComponent } from '#/features/verify-email/VerifyEmail';

export const Route = createFileRoute('/_auth/verify-email')({
  component: VerifyEmail,
});

function VerifyEmail() {
  return <VerifyEmailComponent />;
}
