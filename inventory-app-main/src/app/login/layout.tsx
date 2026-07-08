import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Login — InventoryPro',
  description: 'Sign in to your InventoryPro account',
};

export default function LoginLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
