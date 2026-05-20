import Link from 'next/link';
import Image from 'next/image';

export default function AuthCodeErrorPage() {
  return (
    <div className="max-w-md mx-auto text-center py-20 space-y-6 animate-fade-up">
      <Image src="/logo.webp" alt="" width={80} height={80} className="mx-auto opacity-80" />
      <h1 className="text-2xl font-black text-white uppercase tracking-tight">Authentication failed</h1>
      <p className="text-gray-400 text-sm leading-relaxed">
        Google sign-in could not be completed. Check that Google provider is enabled in Supabase and that your redirect
        URL is listed (e.g. <code className="text-[#53FC18]">http://localhost:3000/auth/callback</code>).
      </p>
      <Link
        href="/login"
        className="inline-block px-8 py-3 rounded-xl bg-[#53FC18] text-gray-950 font-black uppercase tracking-widest text-xs hover:bg-[#6aff35] transition"
      >
        Back to login
      </Link>
    </div>
  );
}
