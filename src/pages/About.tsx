import React from 'react';
import { Header } from '../components/Header';

export function About() {
  const handleSearch = (query: string) => {
    window.location.href = `/?search=${encodeURIComponent(query)}`;
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      <Header onSearch={handleSearch} />

      <main className="container mx-auto px-4 pt-24">
        <div className="max-w-3xl mx-auto">
          <div className="space-y-8">
            {/* About Clipverse Section */}
            <section className="bg-white/5 rounded-2xl p-8 backdrop-blur-lg">
              <h2 className="text-3xl font-bold mb-6 bg-gradient-to-r from-pink-500 via-purple-500 to-cyan-500 bg-clip-text text-transparent">
                About Clipverse
              </h2>
              <div className="space-y-4 text-white/80">
                <p>
                  Welcome to <span className="text-cyan-400 font-semibold">Clipverse</span>, your ultimate destination for fresh, engaging, and dynamic video content. Powered by YouTube's API, our platform curates videos across various genres, ensuring a unique, non-repetitive viewing experience every time you visit.
                </p>
                <p>
                  We feature a wide range of categories, including music, sports, news, movies, entertainment, comedy, education, science, and more—all carefully selected to keep your browsing seamless and distraction-free. Unlike other platforms, Clipverse only showcases full-length videos, filtering out shorts to enhance the quality of your experience.
                </p>
                <p>
                  Our goal is simple: to make video discovery effortless and enjoyable while providing dynamic content that evolves with every visit.
                </p>
              </div>
            </section>

            {/* About Creator Section */}
            <section className="bg-white/5 rounded-2xl p-8 backdrop-blur-lg">
              <h2 className="text-3xl font-bold mb-6 bg-gradient-to-r from-pink-500 via-purple-500 to-cyan-500 bg-clip-text text-transparent">
                About Me – Gowra Pavan Kumar
              </h2>
              <div className="space-y-4 text-white/80">
                <p>
                  I'm <span className="text-cyan-400 font-semibold">Gowra Pavan Kumar</span>, the creator of Clipverse and a passionate tech enthusiast. Currently pursuing my B.Tech in Information Technology at Kallam Haranadhareddy Institute of Technology, I specialize in software development and have expertise in C, Python, HTML, CSS, and JavaScript.
                </p>
                <p>
                  Beyond academics, I love building innovative platforms that enhance user experience, and Clipverse is a reflection of that vision. My goal is to create tech-driven solutions that make content discovery smarter and more engaging.
                </p>
                <p className="font-medium text-white">
                  Let's connect and explore the world of technology together! 🚀
                </p>
              </div>
            </section>
          </div>
        </div>
      </main>
    </div>
  );
}