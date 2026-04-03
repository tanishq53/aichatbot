import "./globals.css";

export const metadata = {
  title: "Nexus AI | Premium Chat",
  description: "A premium AI chat interface powered by Gemini.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}