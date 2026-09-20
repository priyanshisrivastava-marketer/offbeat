import "./offbeat-overrides.css";
import RegisterSW from "./register-sw";

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
        <RegisterSW />
        <script dangerouslySetInnerHTML={{ __html: `
          (function () {
            function fallbackNavigation(event) {
              var target = event.target && event.target.closest ? event.target.closest('button') : null;
              if (!target) return;
              if (target.classList.contains('secondary')) {
                event.preventDefault();
                event.stopPropagation();
                window.location.href = '/explore?mode=guest';
                return;
              }
              if (target.closest('.authCard') && target.classList.contains('generate')) {
                var input = document.getElementById('name');
                var value = input && input.value ? input.value.trim() : '';
                if (!value) return;
                try { localStorage.setItem('offbeat-pending-name', value); } catch (e) {}
                event.preventDefault();
                event.stopPropagation();
                window.location.href = '/explore?mode=profile';
              }
            }
            document.addEventListener('click', fallbackNavigation, true);
          })();
        ` }} />
      </body>
    </html>
  );
}
