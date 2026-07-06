import { useFieldContext } from '../useAppFormContext';
import { FieldInfo } from './FieldInfo';

export type InputProps = {
  type: 'text' | 'password' | 'email';
  label: string;
  placeholder?: string;
  className?: string;
};

export function InputField({ type, label, placeholder, className }: InputProps) {
  const field = useFieldContext<string>();

  return (
    <div className='mb-4'>
      <label className='block text-gray-700 dark:text-gray-200 text-sm font-bold mb-2' htmlFor={label}>
        {label}
      </label>
      <input
        id={label}
        name={field.name}
        type={type}
        value={field.state.value}
        onChange={e => field.handleChange(e.target.value)}
        placeholder={placeholder}
        className={`w-full p-2 border-[1.5px] border-gray-300 dark:border-gray-700 rounded-md dark:focus:outline-0 ${className}`}
      />
      <FieldInfo field={field} />
    </div>
  );
}
