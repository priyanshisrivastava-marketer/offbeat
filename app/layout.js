import "./offbeat-overrides.css";
import "./click-fix.css";
import RegisterSW from "./register-sw";
import SavePlaceEnhancer from "./save-place-enhancer";

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
        <SavePlaceEnhancer />
        <footer style={{ padding: "18px 20px 28px", textAlign: "center", background: "#f7f3eb", color: "#7b817e", fontSize: 12 }}>
          <a href="/community" style={{ color: "inherit", fontWeight: 700 }}>Community</a>
          <span style={{ margin: "0 8px" }}>·</span>
          <a href="/privacy" style={{ color: "inherit", fontWeight: 700 }}>Privacy Policy</a>
          <span style={{ margin: "0 8px" }}>·</span>
          <span>Offbeat</span>
        </footer>
        <RegisterSW />
      </body>
    </html>
  );
}
