import { getBackendUrl } from '../services/api';
import ShowcaseSection from "../components/ui/ShowcaseSection";
import LoginHelmet from '../page-helmets/LoginHelmet';

export default function Login() {
    return (
        <>
            <LoginHelmet />

            <main id="login-page">

                <ShowcaseSection
                    classes="hero-half bg-black"
                >
                    <h1 translate="no">
                        Log<span className="inline-bold inline-teal">In</span>
                    </h1>
                    <h2>Get the full vindroExperience</h2>
                </ShowcaseSection>

                <ShowcaseSection
                    id="login-content"
                    classes="hero-half bg-gray"
                >

                    <div className="auth-container">

                        <div className="auth-info">
                            <h3>We make it easy, no password needed.</h3>
                            <h4>If you already have an account, you'll be logged in automatically. If not, we’ll create one for you using your email.</h4>
                        </div>

                        <div className="social-login">
                            <button
                                type="button"
                                onClick={() => {
                                    window.location.href = `${getBackendUrl()}/accounts/google/login/`;
                                }}
                                className="btn btn-social btn-google"
                            >
                                <svg className="google-icon" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                                </svg>
                                Continue with Google
                            </button>
                            <button
                                type="button"
                                onClick={() => {
                                    window.location.href = `${getBackendUrl()}/accounts/github/login/`;
                                }}
                                className="btn btn-social btn-github"
                            >
                                <svg className="github-icon" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0 1 12 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z" />
                                </svg>
                                Continue with GitHub
                            </button>
                        </div>
                    </div>

                    <h5>By joining VindroGames, you will be able to save your scores from different games and participate in different bracket events.</h5>
                    <h5>We do not share your data with anybody.</h5>
                </ShowcaseSection>

            </main>
        </>
    );
}
