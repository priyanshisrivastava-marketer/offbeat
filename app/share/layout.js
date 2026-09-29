export const metadata = {
  title: "Offbeat — A ticket out the door",
  description: "A spontaneous little adventure, made for you.",
  openGraph: {
    title: "Offbeat — A ticket out the door",
    description: "A spontaneous little adventure, made for you.",
    siteName: "Offbeat",
    type: "website",
    images: [
      {
        url: "/brand/offbeat-mark.png",
        alt: "Offbeat",
      },
    ],
  },
  twitter: {
    card: "summary",
    title: "Offbeat — A ticket out the door",
    description: "A spontaneous little adventure, made for you.",
    images: ["/brand/offbeat-mark.png"],
  },
  icons: {
    icon: "/brand/offbeat-mark.png",
    apple: "/brand/offbeat-mark.png",
  },
};

export default function ShareLayout({ children }) {
  return children;
}
