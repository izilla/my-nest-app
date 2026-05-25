import { FormButton } from '#/components/forms/fields/FormButton';
import { InputField } from '#/components/forms/fields/InputField';
import { fieldContext, formContext } from '#/components/forms/useAppFormContext';
import { createFormHook } from '@tanstack/react-form';
import { useTranslation } from 'react-i18next';
import { z } from 'zod';

const { useAppForm } = createFormHook({
  fieldComponents: {
    InputField,
  },
  formComponents: {
    FormButton,
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

const loginSchema = z.object({
  email: z.email({ message: 'Please enter a valid email address' }),
  password: z.string().min(6, { message: 'Password must be at least 6 characters' }),
});

export const SignIn = () => {
  const { t } = useTranslation();

  const form = useAppForm({
    defaultValues: defaultNewUser,
    validators: {
      onChange: loginSchema,
    },
    onSubmit: values => {
      console.log('Form submitted with values:', values);
    },
  });

  return (
    <div className='flex flex-col align-content-center justify-around h-full p-8'>
      <div className='border dark:border-gray-800 border-gray-300 rounded-lg p-8 bg-white dark:bg-emerald-800 shadow-md max-w-md mx-auto'>
        <form
          onSubmit={e => {
            e.preventDefault();
            form.handleSubmit(e);
          }}>
          <h1 className=''>{t('welcome')}</h1>
          <form.AppField
            name='email'
            children={field => <field.InputField type='email' label={t('email')} placeholder={t('email')} />}
          />
          <form.AppField
            name='password'
            children={field => <field.InputField type='password' label='Password' placeholder='Password' />}
          />
          <form.Subscribe
            selector={state => [state.canSubmit, state.isSubmitting]}
            children={([canSubmit, isSubmitting]) => (
              <form.FormButton type='submit' disabled={!canSubmit || isSubmitting}>
                {t('sign in')}
              </form.FormButton>
            )}
          />
        </form>
      </div>
    </div>
  );
};
