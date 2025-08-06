import SmartLink from "../components/ui/SmartLink";
import PrivacyCookiesHelmet from "../page-helmets/PrivacyCookiesHelmet";
import HeroHalfSection from "../components/ui/HeroHalfSection";
import CookieSection from "../components/pages/privacy-cookies/CookieSection";
import PrivacyPolicySection from "../components/pages/privacy-cookies/PrivacyPolicySection"

function PrivacyCookies() {

    return (
        <>
            <PrivacyCookiesHelmet />

            <main id="privacy-page-content">
                <HeroHalfSection
                    title={
                        <>
                            data<span className="inline-bold inline-teal">&</span>cookies
                        </>
                    }
                    subtitle="We don't do ads and we don't give your info to anybody"
                />
                <PrivacyPolicySection />
                <CookieSection />
            </main>
        </>
    )

}

export default PrivacyCookies;