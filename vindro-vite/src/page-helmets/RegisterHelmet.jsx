import { Helmet } from 'react-helmet-async';

export default function RegisterHelmet() {
  return (
    <Helmet>
      <title>Register | Vindrogames</title>
      <meta name="description" content="Create a Vindrogames account to save your progress, track scores, and compete with players worldwide." />
      <meta name="keywords" content="vindrogames, register, signup, create account, gaming, join" />

      {/* Open Graph / Facebook */}
      <meta property="og:type" content="website" />
      <meta property="og:title" content="Register | Vindrogames" />
      <meta property="og:description" content="Join Vindrogames - Create your account today" />

      {/* Twitter */}
      <meta name="twitter:card" content="summary" />
      <meta name="twitter:title" content="Register | Vindrogames" />
      <meta name="twitter:description" content="Join Vindrogames - Create your account today" />
    </Helmet>
  );
}
