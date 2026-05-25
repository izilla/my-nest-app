type SubmitButtonProps = {
  type: 'submit';
  onClick?: never;
};

type PlainButtonProps = {
  type: 'button';
  onClick: (event: React.MouseEvent<HTMLButtonElement>) => void;
};

export type ButtonProps = {
  className?: string;
  label: string;
  disabled?: boolean;
} & (SubmitButtonProps | PlainButtonProps);

export const Button = ({ className, disabled, label, type, onClick }: ButtonProps) => {
  const handleOnClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    if (type === 'button') {
      event.preventDefault();
      if (!disabled) {
        onClick(event);
      }
    }
  };

  return (
    <button
      type={type}
      className={`rounded-md disabled:bg-slate-500 bg-slate-700 px-4 py-2 text-white disabled:text-slate-400 hover:bg-slate-800 ${className}`}
      disabled={disabled}
      onClick={handleOnClick}>
      {label}
    </button>
  );
};
