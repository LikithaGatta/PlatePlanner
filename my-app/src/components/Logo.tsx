interface LogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export function Logo({ className = '', size = 'md' }: LogoProps) {
  const sizeMap = {
    sm: 'w-5 h-5',
    md: 'w-8 h-8',
    lg: 'w-10 h-10'
  };

  return (
    <img 
      src="/logo.png" 
      alt="PlatePlanner Logo" 
      className={`${sizeMap[size]} ${className}`}
    />
  );
}
