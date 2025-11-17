export default function Logo({ className = "" }) {
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      {/* Logo do arquivo de imagem */}
      <img 
        src="/logo/logo.png" 
        alt="Diamond Store Logo"
        className="h-[67px] sm:h-[90px] md:h-[112px] w-auto"
        onError={(e) => {
          // Fallback: tentar logo.png na raiz
          if (e.target.src.includes('/logo/logo.png')) {
            e.target.src = '/logo.png';
          } else {
            e.target.style.display = 'none';
          }
        }}
      />
    </div>
  );
}

