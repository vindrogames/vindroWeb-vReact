function TeamMember({ imgSource, imgAltText, memberName, children }) {

    return (

        <div className="team-member">
            <img src={imgSource} alt={imgAltText} />
            <div>
                <h5>{memberName}</h5>
                <p>{children}</p>
            </div>
        </div>
    )
}

export default TeamMember;