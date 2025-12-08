import { redirect } from 'next/navigation';

export default function HomePage() {
  try {
    redirect('/auth/login');
  } catch (error) {
    // Redirect throws an error in Next.js (expected behavior)
    // Re-throw it so Next.js can handle it properly
    throw error;
  }
}
