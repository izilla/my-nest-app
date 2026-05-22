export type InputProps = {
  type: 'text' | 'password' | 'email';
  label: string;
  placeholder?: string;
  className?: string;
};

export const Input = ({ type, label, placeholder, className }: InputProps) => {
  return (
    <div className='mb-4'>
      <label className='block text-gray-700 text-sm font-bold mb-2' htmlFor={label}>
        {label}
      </label>
      <input
        id={label}
        type={type}
        placeholder={placeholder}
        className={`w-full p-2 border border-gray-300 rounded-md ${className}`}
      />
    </div>
  );
};
