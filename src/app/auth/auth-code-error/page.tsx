import Link from 'next/link';

export default function AuthCodeErrorPage() {
  return (
    <div className="max-w-md mx-auto text-center py-20 space-y-6">
      <h1 className="text-2xl font-black text-white">Authentication failed</h1>
      <p className="text-gray-400 text-sm">
        The sign-in link may have expired or already been used. Please try logging in again.
      </p>
      <Link
        href="/login"
        className="inline-block px-6 py-3 rounded-full bg-green-600 text-white font-bold hover:bg-green-700 transition"
      >
        Back to login
      </Link>
    </div>
  );
}
