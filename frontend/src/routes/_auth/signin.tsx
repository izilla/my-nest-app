import { createFileRoute } from '@tanstack/react-router';
import { SignIn as SignInComponent } from '#/features/signin/SignIn';

export const Route = createFileRoute('/_auth/signin')({ component: SignIn });

function SignIn() {
  return <SignInComponent />;
}
