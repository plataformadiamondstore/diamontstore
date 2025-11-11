export default function Logo({ className = "" }) {
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      {/* Logo do arquivo de imagem */}
      <img 
        src="/logo.jpeg" 
        alt="SLOTHS Logo" 
        className="h-20 w-auto"
        onError={(e) => {
          // Fallback caso a imagem não seja encontrada
          e.target.style.display = 'none';
        }}
      />
    </div>
  );
}

