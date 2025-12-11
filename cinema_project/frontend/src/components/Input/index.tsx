import type { ChangeEvent } from 'react';

interface InputProps {
  id: string;
  name?: string;
  label?: string;
  type?: 'text' | 'password' | 'email' | 'number' | 'date' | 'datetime-local';
  placeholder?: string;
  value?: string | number;
  onChange?: (e: ChangeEvent<HTMLInputElement>) => void;
  error?: string;
  className?: string;
}

const idCapitalized = (id: string) => id.charAt(0).toUpperCase() + id.slice(1);

export const Input = ({
  id,
  name,
  label,
  type = 'text',
  placeholder = '',
  value,
  onChange,
  error,
  className,
}: InputProps) => {
  const effectiveLabel = label ?? idCapitalized(id);
  const inputClass = [
    'form-control',
    error ? 'is-invalid' : '',
    className ?? '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className="mb-3">
      <label htmlFor={id} className="form-label">
        {effectiveLabel}
      </label>
      <input
        id={id}
        name={name ?? id}
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        className={inputClass}
      />
      {error && <div className="invalid-feedback">{error}</div>}
    </div>
  );
};