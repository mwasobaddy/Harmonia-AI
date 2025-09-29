
import Link from 'next/link'

export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  href,
  onClick,
  disabled = false,
  className = '',
  ...props
}) {
  // Modernized base classes and variants (from EnhancedHeader/index.js)
  const baseClasses = 'inline-flex items-center justify-center font-semibold transition-all duration-300 rounded-xl focus:outline-none focus:ring-4 focus:ring-opacity-50 transform hover:scale-105 active:scale-95';

  const sizeClasses = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-6 py-3 text-base',
    lg: 'px-8 py-4 text-lg'
  };

  const variantClasses = {
    primary: 'bg-gradient-to-r from-[#73cfd0] to-[#5abdc4] text-black hover:from-[#5abdc4] hover:to-[#4aa9b8] focus:ring-[#73cfd0] shadow-lg hover:shadow-xl',
    secondary: 'bg-white/10 backdrop-blur-sm border border-white/20 text-white hover:bg-white/20 focus:ring-white/50 shadow-lg hover:shadow-xl',
    outline: 'border-2 border-[#73cfd0] text-[#73cfd0] hover:bg-[#73cfd0] hover:text-black focus:ring-[#73cfd0]',
    danger: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500'
  };

  const disabledClasses = disabled ? 'opacity-50 cursor-not-allowed' : '';

  const classes = `${baseClasses} ${sizeClasses[size]} ${variantClasses[variant]} ${disabledClasses} ${className}`;

  if (href) {
    return (
      <Link href={href} className={classes} {...props}>
        {children}
      </Link>
    );
  }

  return (
    <button
      className={classes}
      onClick={onClick}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
}