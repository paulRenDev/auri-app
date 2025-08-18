export const metadata = { title: "Auri", description: "AI tutor MVP" };
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return <html lang="en"><body>{children}</body></html>;
}
