export default function Button({ children, loading, variant = 'primary', className = '', ...props }) {
  const base = 'inline-flex items-center justify-center gap-2 font-semibold rounded-xl transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed px-6 py-3 text-sm';
  const variants = {
    primary: 'bg-primary hover:bg-primary-light text-white shadow-md hover:shadow-lg',
    outline: 'border-2 border-primary text-primary hover:bg-primary hover:text-white',
    danger: 'bg-red-600 hover:bg-red-700 text-white shadow-md',
    ghost: 'text-primary hover:bg-primary/10',
  };
  return (
    <button className={`${base} ${variants[variant]} ${className}`} disabled={loading || props.disabled} {...props}>
      {loading ? <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" /> : null}
      {children}
    </button>
  );
}
