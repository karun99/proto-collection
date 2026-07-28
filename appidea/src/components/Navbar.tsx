import Link from 'next/link';

export default function Navbar() {
  return (
    <nav className="bg-slate-900/95 backdrop-blur-md text-white sticky top-0 z-[100] border-b border-white/5">
      <div className="container mx-auto px-4 md:px-6">
        <div className="flex h-16 items-center justify-between gap-4">
          <Link href="/" className="flex items-center gap-2 group shrink-0">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center font-black text-sm group-hover:scale-110 transition-transform">
              A
            </div>
            <span className="text-xl font-black tracking-tighter group-hover:text-blue-400 transition-colors">
              AppIdea
            </span>
          </Link>
          
          <div className="flex items-center gap-1 md:gap-4 overflow-x-auto no-scrollbar py-1">
            {[
              { label: 'Prompts', href: '/prompts' },
              { label: 'Ideation', href: '/ideation' },
              { label: 'Admin', href: '/admin' }
            ].map((link) => (
              <Link 
                key={link.href}
                href={link.href} 
                className="px-3 py-1.5 rounded-lg text-sm font-bold text-slate-400 hover:text-white hover:bg-white/10 transition-all whitespace-nowrap"
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </nav>
  );
}
