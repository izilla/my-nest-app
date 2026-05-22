type SubmitButtonProps = {
  type: 'submit';
  onClick?: never;
};

type PlainButtonProps = {
  type: 'button';
  onClick: (event: React.MouseEvent<HTMLButtonElement>) => void;
};

type ButtonProps = {
  label: string;
  disabled: boolean;
} & (SubmitButtonProps | PlainButtonProps);

export const Button = ({ disabled, label, type, onClick }: ButtonProps) => {
  const handleOnClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    if (type === 'button') {
      event.preventDefault();
      onClick(event);
    }
  };

  return (
    <button
      type={type}
      className='rounded-md bg-slate-700 px-4 py-2 text-white hover:bg-slate-800'
      disabled={disabled}
      onClick={handleOnClick}>
      {label}
    </button>
  );
};
