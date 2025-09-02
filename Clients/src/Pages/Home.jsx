
import About from '../Components/About'
import Contact from '../Components/Contact'
import Footer from '../Components/Footer'
import Navbar from '../Components/Navbar'
import Herosection from '../Herosection'

function Home() {
  return (
    <div>
        <Navbar />
        <Herosection />
        <About/>
        <Contact />
        <Footer />
    </div>
  )
}

export default Home