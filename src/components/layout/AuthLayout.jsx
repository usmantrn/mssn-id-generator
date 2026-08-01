export default function AuthLayout({ children }) {
  return (
    <div className="min-h-screen w-full hero-bg flex flex-col py-8 px-4 relative overflow-x-hidden">
      {/* Decorative circles */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-white/5 rounded-full -translate-x-1/2 -translate-y-1/2 pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-white/5 rounded-full translate-x-1/2 translate-y-1/2 pointer-events-none" />
      
      {/* Inner wrapper allows it to center but not get cut off at top */}
      <div className="w-full max-w-md mx-auto relative z-10 my-auto pb-10">
        {children}
      </div>
    </div>
  );
}
