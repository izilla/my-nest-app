type FieldInfoProps = {
  field: Record<string, any>;
};

export const FieldInfo = ({ field }: FieldInfoProps) => {
  const {
    state: {
      meta: { isValid },
    },
  } = field;

  return <>{!isValid && <div className='text-rose-500'>Invalid</div>}</>;
};
