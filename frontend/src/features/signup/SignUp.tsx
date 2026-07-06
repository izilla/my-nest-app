/** biome-ignore-all lint/complexity/noExcessiveLinesPerFunction: TODO refactor */
import { createFormHook } from '@tanstack/react-form';
import { useMutation } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import z from 'zod';
import api from '#/api/axiosInstance';
import { FormButton } from '#/components/forms/fields/FormButton';
import { InputField } from '#/components/forms/fields/InputField';
import { fieldContext, formContext } from '#/components/forms/useAppFormContext';

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

type NewTenant = {
  organization: string;
  email: string;
  password: string;
  confirmPassword: string;
};

const defaultNewTenant: NewTenant = {
  organization: '',
  email: '',
  password: '',
  confirmPassword: '',
};

const signUpSchema = z.object({
  organization: z.string().min(2, { message: 'Organization name must be at least 2 characters' }),
  email: z.email({ message: 'Please enter a valid email address' }),
  password: z.string().min(6, { message: 'Password must be at least 6 characters' }),
  confirmPassword: z.string().min(6, { message: 'Confirm Password must be at least 6 characters' }),
});

const adaptToApi = (newTenant: NewTenant) => ({
  name: newTenant.organization,
  tenantAdmins: [
    {
      email: newTenant.email,
      name: newTenant.email.split('@')[0], // Use the part before @ as the name
    },
  ],
});

export const SignUp = () => {
  const { t } = useTranslation();
  const apiUrl = import.meta.env.VITE_API_URL;

  const mutation = useMutation({
    mutationFn: async (newTenant: NewTenant) => {
      const { data } = await api.post(`${apiUrl}/tenants`, JSON.stringify(adaptToApi(newTenant)));

      if (!data) {
        throw new Error('Failed to create tenant');
      }

      return data;
    },
  });

  const form = useAppForm({
    defaultValues: defaultNewTenant,
    validators: {
      onChange: signUpSchema,
    },
    onSubmit: form => {
      mutation.mutate(form.value);
      console.log('Form submitted with values:', form.value);
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
            name='organization'
            children={field => (
              <field.InputField
                type='text'
                label={t('onboarding.organization')}
                placeholder={t('onboarding.organization')}
              />
            )}
          />
          <form.AppField
            name='email'
            children={field => <field.InputField type='email' label={t('email')} placeholder={t('email')} />}
          />
          <form.AppField
            name='password'
            children={field => <field.InputField type='password' label='Password' placeholder='Password' />}
          />
          <form.AppField
            name='confirmPassword'
            children={field => (
              <field.InputField type='password' label='Confirm Password' placeholder='Confirm Password' />
            )}
          />
          <form.Subscribe
            selector={state => [state.canSubmit, state.isSubmitting]}
            children={([canSubmit, isSubmitting]) => (
              <form.FormButton type='submit' disabled={!canSubmit || isSubmitting}>
                {t('sign up')}
              </form.FormButton>
            )}
          />
        </form>
      </div>
    </div>
  );
};
