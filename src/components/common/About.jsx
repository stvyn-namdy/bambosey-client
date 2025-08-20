// client/src/components/About.jsx

export default function About() {
  return (
    <section className="py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center max-w-4xl mx-auto">
          <h2 className="text-3xl font-light mb-6 text-gray-900">About BamBosey</h2>
          <p className="text-lg text-gray-600 mb-8 leading-relaxed">
            BamBosey is more than just a fashion brand – we're a lifestyle destination that celebrates 
            individuality and self-expression. Founded with a passion for quality craftsmanship and 
            timeless design, we curate collections that seamlessly blend contemporary trends with 
            classic elegance.
          </p>
          <div className="grid md:grid-cols-3 gap-8 mt-12">
            <div className="text-center">
              <div className="w-16 h-16 bg-black rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-medium mb-2 text-gray-900">Quality First</h3>
              <p className="text-gray-600">
                Every piece is crafted with premium materials and attention to detail, 
                ensuring lasting quality and comfort.
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-black rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-xl font-medium mb-2 text-gray-900">Fast Fashion</h3>
              <p className="text-gray-600">
                Stay ahead of trends with our constantly updated collections that bring 
                the latest styles straight to your wardrobe.
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-black rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-medium mb-2 text-gray-900">Sustainable</h3>
              <p className="text-gray-600">
                We're committed to ethical practices and sustainable fashion that respects 
                both people and the planet.
              </p>
            </div>
          </div>
          <div className="mt-12">
            <button className="bg-black text-white px-8 py-3 rounded-md hover:bg-gray-800 transition-colors">
              Learn More About Us
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
