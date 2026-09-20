import "./offbeat-overrides.css";
import RegisterSW from "./register-sw";
import LocationBridge from "./location-bridge";

export const metadata = {
  title: "Offbeat — A ticket out the door",
  description: "Spontaneous local micro-adventures, generated for you.",
  manifest: "/manifest.json",
  themeColor: "#E8A33D",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Offbeat",
  },
  icons: {
    icon: "/icons/icon-192.png",
    apple: "/icons/icon-192.png",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body style={{ margin: 0 }}>
        {children}
        <LocationBridge />
        <RegisterSW />
      </body>
    </html>
  );
}
