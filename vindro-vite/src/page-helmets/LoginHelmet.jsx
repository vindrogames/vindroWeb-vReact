import { Helmet } from 'react-helmet-async';

export default function LoginHelmet() {
    return (
        <Helmet>
            <title>Login | Vindrogames</title>
            <meta name="description" content="Login to your Vindrogames account to track your scores and compete with players worldwide." />
            <meta name="keywords" content="vindrogames, login, signin, gaming, authentication" />

            {/* Open Graph / Facebook */}
            <meta property="og:type" content="website" />
            <meta property="og:title" content="Login | Vindrogames" />
            <meta property="og:description" content="Login to your Vindrogames account" />

            {/* Twitter */}
            <meta name="twitter:card" content="summary" />
            <meta name="twitter:title" content="Login | Vindrogames" />
            <meta name="twitter:description" content="Login to your Vindrogames account" />
        </Helmet>
    );
}
