import TeamMember from "./TeamMember";

const HomeAbout = () => {

    return (

        <section id="home-about" className="hero-half bg-tan">
            <div className="team-container">
                <TeamMember 
                    imgSource="img/fer-vindro-good.webp"
                    imgAltText="Fernando Giménez Cacho is a Software engineer specialized in cloud security"
                    memberName="Zeneke"
                    
                >
                    <span translate="no">Fernando Giménez</span> is a Computer Engineer working primarily in cloud services and security.
                </TeamMember>
                <TeamMember 
                    imgSource="img/mike-vindro-good.webp"
                    imgAltText="Michael Thomas Bennett is a creative teacher gone programmer"
                    memberName="Mikelele"
                >
                    <span translate="no">Michael Bennett</span> works in education as a University teacher, Teacher trainer and Education Innovation consultant.
                </TeamMember>
            </div>
        </section>
    )
}

export default HomeAbout;