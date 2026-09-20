export const metadata = {
  title: "Privacy Policy | Offbeat",
  description: "How Offbeat handles account, adventure, community and location information.",
};

export default function PrivacyPage() {
  return (
    <main style={{ minHeight: "100vh", padding: "48px 20px", background: "#f7f5f0", color: "#182018" }}>
      <article style={{ maxWidth: 760, margin: "0 auto", background: "#fff", borderRadius: 28, padding: "36px 28px", boxShadow: "0 12px 40px rgba(0,0,0,.08)" }}>
        <a href="/" style={{ color: "inherit", textDecoration: "none", fontWeight: 700 }}>← Back to Offbeat</a>
        <p style={{ letterSpacing: ".12em", textTransform: "uppercase", fontSize: 12, fontWeight: 700, marginTop: 28 }}>Offbeat</p>
        <h1 style={{ fontSize: "clamp(32px, 7vw, 52px)", margin: "8px 0 12px" }}>Privacy Policy</h1>
        <p style={{ color: "#687067" }}>Last updated: September 20, 2026</p>
        <Section title="What Offbeat collects"><p>Offbeat may process information you provide when you sign in, create a profile, save or complete an adventure, or participate in the community. This can include your name, email address, profile photo, preferences, posts, comments and other content you choose to provide.</p></Section>
        <Section title="Location information"><p>Offbeat does not need your precise location to let you manually enter a city. If you choose <strong>Locate me</strong>, your browser may provide your device's precise GPS coordinates after you grant permission.</p><p>Those coordinates are used only to make nearby-place and distance-based adventure searches more accurate. They are sent to Offbeat's nearby-place search endpoint for that request and are not intended to be stored in your profile or adventure history.</p><p>You can deny location permission and continue using manual city entry.</p></Section>
        <Section title="How information is used"><p>Information is used to provide and improve Offbeat, generate relevant adventures, save your requested history and preferences, support community features, maintain security, and prevent abuse of third-party APIs.</p></Section>
        <Section title="Google sign-in"><p>If you choose Google sign-in, Offbeat receives the account information made available by Firebase Authentication, such as your name, email address and profile image. Your password is not handled by Offbeat.</p></Section>
        <Section title="Community content"><p>If you publish a community post, information you choose to share, such as your caption, media, place and public profile information, may be visible to other Offbeat users. Do not post information you want to keep private.</p></Section>
        <Section title="Third-party services"><p>Offbeat may use services such as Firebase, Google Maps/Places and generative AI services to provide authentication, storage, place information and adventure generation. Data sent to those services is limited to what is needed for the relevant feature.</p></Section>
        <Section title="Security and retention"><p>Offbeat uses authentication, access controls and server-side protections designed to limit unauthorized access and API abuse. Information is retained only as needed to provide the relevant features, maintain security, meet legal obligations, or until you request deletion where applicable.</p></Section>
        <Section title="Your choices"><p>You can choose not to use Locate me, use Offbeat as a guest where available, avoid publishing community content, or stop using your account. You may also contact the Offbeat team to request access, correction or deletion of personal information, subject to applicable requirements.</p></Section>
        <Section title="Contact"><p>For privacy questions or requests, contact the Offbeat team through the contact details provided in the application or its official repository.</p></Section>
        <p style={{ marginTop: 36, paddingTop: 20, borderTop: "1px solid #e5e2db", fontSize: 13, color: "#687067" }}>This is the product privacy policy for the current Offbeat prototype. It should be reviewed and updated before a public commercial launch, particularly as community uploads, analytics, payments, or additional third-party services are introduced.</p>
      </article>
    </main>
  );
}

function Section({ title, children }) {
  return <section style={{ marginTop: 30 }}><h2 style={{ fontSize: 20, marginBottom: 10 }}>{title}</h2><div style={{ lineHeight: 1.7, color: "#394139" }}>{children}</div></section>;
}
