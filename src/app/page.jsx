// client/src/app/page.jsx

import Hero from "../components/common/Hero";
import About from "../components/common/About";
import NewArrivals from "../components/common/NewArrivals";

export default function Home() {
  return (
    <main>
      <Hero />
      <About />
      <NewArrivals />
    </main>
  );
}
