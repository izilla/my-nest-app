import { createFileRoute } from '@tanstack/react-router';
import { SignUp as SignUpComponent } from '#/features/signup/SignUp';

export const Route = createFileRoute('/_auth/signup')({
  component: SignUp,
})

function SignUp() {
  return (
    <SignUpComponent />
  );
}
