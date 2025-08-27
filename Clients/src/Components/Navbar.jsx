import { Link } from "react-router-dom"
import { FaRegBell } from "react-icons/fa";
import { useState } from "react";
function Navbar() {
    const [isOpen, setIsOpen] = useState(false);
    const toggleOpen = () => {
        setIsOpen(prev => !prev);
    };
    return (
        <div className='shadow-md shadow-black/30 w-full h-[10vh] relative'>
            {/* navbar for desktop */}
           <div className="flex justify-evenly items-center pt-3  ">
               <div>
                 <nav className='flex justify-center gap-[4rem] items-center  '>
                <Link to='/' className="">Home</Link>
                <Link to='#' className="">Cv Scan</Link>
                <Link to='#' className="">Contact</Link>
            </nav>
               </div>
             <div className="flex justify-center items-center gap-3">
                 <button className="bg-green-400 p-2 rounded-md">
                     <Link to='/form'> Register</Link>
                 </button>
                 <button type="button" onClick={toggleOpen} aria-label="Notifications" className="p-1 rounded hover:bg-gray-100">
                 <FaRegBell className="text-2xl"/>
                 </button>
                
             </div>
              {
                    isOpen && (
                      <div className="absolute right-4 top-[10vh] bg-gray-200 w-[15rem] h-[60vh] shadow-lg rounded-md">
                        
                      </div>
                    )
                 }
           </div>
            {/* navbar for desktop */}

        </div>
    )
}

export default Navbar