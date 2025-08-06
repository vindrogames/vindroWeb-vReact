import BlogHelmet from '../page-helmets/BlogHelmet';
import ShowcaseSection from '../components/ui/ShowcaseSection';

function Blog() {

    return (

        <>
            <BlogHelmet />

            <main>

                <ShowcaseSection
                    classes="hero-half bg-black"
                >
                    <h1>our<span className="inline-bold inline-teal">Blog</span></h1>
                    <h2>A digital journal dedicated to learning and programming</h2>
                </ShowcaseSection>

                <section id="under-construction">
                    <div className="loading">
                        <h1>Pronto jugaremos</h1>
                        <div className="loader">
                            <span className="loader-element"></span>
                            <span className="loader-element"></span>
                            <span className="loader-element"></span>
                        </div>
                    </div>
                </section>

            </main>
        </>
    )
};

export default Blog;