import { createFormHook, createFormHookContexts } from '@tanstack/react-form';
import { z } from 'zod';
import { Button } from '#/components/Button';
import { Input } from '#/components/Input';

const { formContext, fieldContext } = createFormHookContexts();
const { useAppForm } = createFormHook({
  fieldComponents: {
    Input,
  },
  formComponents: {
    Button,
  },
  fieldContext,
  formContext,
});

type NewUser = {
  email: string;
  password: string;
};

const defaultNewUser: NewUser = {
  email: '',
  password: '',
};

export const SignIn = () => {
  const form = useAppForm({
    defaultValues: defaultNewUser,
    validators: {
      onChange: z.object({
        email: z.email({ message: 'Please enter a valid email address' }),
        password: z.string().min(6, { message: 'Password must be at least 6 characters' }),
      }),
    },
    onSubmit: values => {
      console.log('Form submitted with values:', values);
    },
  });

  return (
    <div className='flex flex-col align-content-center p-8'>
      <div className='border border-gray-300 rounded-lg p-8 bg-white shadow-md w-full max-w-md mx-auto'>
        <form
          onSubmit={e => {
            e.preventDefault();
            form.handleSubmit(e);
            console.log('Submitting form with values:', form.state.values);
          }}>
          <h1 className=''>Welcome</h1>
          <form.AppField
            name='email'
            children={field => <field.Input type='email' label='Email' placeholder='Email' />}
          />
          <form.AppField
            name='password'
            children={field => <field.Input type='password' label='Password' placeholder='Password' />}
          />
          <form.AppForm>
            <form.Button label='Sign In' type='submit' disabled={!form.state.isValid || form.state.isValidating} />
          </form.AppForm>
          <p className='prose'>{form.state.isValid || 'not valid'}</p>
          <p className='prose'>{form.state.isValidating || 'not validating'}</p>
        </form>
      </div>
    </div>
  );
};
