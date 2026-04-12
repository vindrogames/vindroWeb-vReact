import SmartLink from "../../ui/SmartLink"

const PrivacyPolicySection = () => {

    return (
        <section id="privacy">
            <h2>Privacy Policy</h2>
            <p className="update"><em>Last updated April 9, 2026</em></p>
            <p>Your privacy is important to us. It is <span translate="no">Vindrogames'</span> policy to respect your privacy regarding any information we may collect from you across our website, <span translate="no" className="inline-green inline-bold">www.vindrogames.com</span>, and other sites we own and operate.</p>
            <h3>Information we collect</h3>
            <h5>Account & Personal Information</h5>
            <p>When you sign up using a Social Provider, for example Google, we receive and store:</p>
            <ul>
                <li>Email Address: Used to identify your account and contact you for collaborations.</li>
                <li>Public Profile Info: Your selected profile icon (Avatar) and your chosen username/nickname to display on global leaderboards.</li>
                <li>Authentication Data: We use secure social authentication. We never see or store your Google or GitHub passwords.</li>
            </ul>
            <h5>Usage data</h5>
            <p>We may also collect information about how you interact with our website. This may include the country from which you visit our webpage, browser type, pages visited, and other usage data. This information is collected automatically through cookies and similar tracking technologies that can be deactivated.</p>
            <h5>Game Data & High Scores</h5>
            <p>If you are logged in, we store your game scores, bracket participation, and play dates on our secure database. If you play as a guest, scores are stored locally on your device.</p>
            <h3>How We Use Your Data</h3>
            <h5>Personal information</h5>
            <p>We use the personal information we collect to communicate with you and provide the services you request. This may only include responding to your contact request or displaying your scores of our games.</p>
            <h5>Usage Data</h5>
            <p>We use usage data to analyze trends, administer the site, track users' movements around the site, and gather demographic information about our user base as a whole. This information helps us improve our website as well as an opportunity to learn data analytics.</p>
            <p>To provide the "vindroExperience" we save your game stats, profile info (avatar and userName) and manage any tournament brackets you participate in.</p>
            <h5>Third-Party Services</h5>
            <p>We may use Google Analytics to track and analyze usage data which uses cookies and similar technologies to collect information about your interactions with our website. You can learn more about Google Analytics' data practices and opt-out options by visiting their <SmartLink to="https://policies.google.com/privacy">Privacy & Terms</SmartLink> page</p>
            <p>Our Google Analytics is NOT connected to any other Google services.</p>
            <h5>Data Security</h5>
            <p>We take reasonable precautions to protect your personal information and ensure that it is not lost, misused, accessed, disclosed, altered, or destroyed. However, no method of transmission over the internet or electronic storage is 100% secure, and we cannot guarantee absolute security.</p>
        </section>
    )
}

export default PrivacyPolicySection