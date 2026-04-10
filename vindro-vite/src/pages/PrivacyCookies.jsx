import PrivacyCookiesHelmet from "../page-helmets/PrivacyCookiesHelmet";
import ShowcaseSection from "../components/ui/ShowcaseSection";
import CookieSection from "../components/pages/privacy-cookies/CookieSection";
import PrivacyPolicySection from "../components/pages/privacy-cookies/PrivacyPolicySection"
import TermsSection from "../components/pages/privacy-cookies/TermsSection";

function PrivacyCookies() {

    return (
        <>
            <PrivacyCookiesHelmet />

            <main id="privacy-page-content">

                <ShowcaseSection
                    classes="hero-half bg-black"
                >
                    <h1>data<span className="inline-bold inline-teal">&</span>cookies</h1>
                    <h2>We don't do ads and we don't give your info to anybody</h2>
                </ShowcaseSection>

                <PrivacyPolicySection />

                <CookieSection />

                <TermsSection />

            </main>
        </>
    )

}

export default PrivacyCookies;