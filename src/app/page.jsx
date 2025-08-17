// client/src/app/page.jsx

import Hero from "../components/Hero";
import About from "../components/About";
import NewArrivals from "../components/NewArrivals";

export default function Home() {
  return (
    <main>
      <Hero />
      <About />
      <NewArrivals />
    </main>
  );
}
