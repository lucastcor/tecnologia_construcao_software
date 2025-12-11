// Propriedades do botão
interface ButtonProps {
  type?: 'button' | 'submit' | 'reset';
  label: string;
  variant?:
    | 'primary'
    | 'secondary'
    | 'success'
    | 'danger'
    | 'warning'
    | 'info'
    | 'light'
    | 'dark'
    | 'link'
    | 'outline-primary'
    | 'outline-secondary'
    | 'outline-success'
    | 'outline-danger'
    | 'outline-warning'
    | 'outline-info'
    | 'outline-light'
    | 'outline-dark';
  onClick?: () => void;
}

export const Button = ({
  type = 'button',
  label,
  variant = 'primary',
  onClick,
}: ButtonProps) => {
  return (
    <button
      type={type}
      className={`btn btn-${variant}`}
      onClick={onClick}
    >
      {label}
    </button>
  );
};