import React from 'react'
import manWithLaptop from '../assets/Images/manWithLaptop.png'
import AssessifyLogo from '../assets/Images/Assessify.png'
import '../App.css'
import { Link } from 'react-router-dom';
function Home() {
  return (
    <div className='flex w-full h-[100vh] items-center flex-col lg:flex-row p-6 gap-4 justify-center bg-[#fffefe]'>
      <div className='w-full h-fit lg:h-full flex items-center justify-center lg:max-w-[50vw]'>
        <img src={manWithLaptop} alt="" className='w-[90%] md:w-[80%] lg:w-full' />
      </div>
      <div className='flex flex-col justify-center items-center gap-4 text-center p-5'>
        <div className='flex items-center gap-2'>
          <img src={AssessifyLogo} alt="" className='w-[70px] h-[70px]' />
          <p className='text-3xl font-bold tracking-[-0.48px] text-[#E53935] select-none'>Assessify</p>
        </div>
        <h2 className='text-2xl font-bold'>Revolutionize Your Hiring Process with AI Interviews</h2>
        <p className='text-lg'>Leverage cutting-edge AI technology to conduct efficient and insightful candidate interviews, ensuring you find the perfect fit for your team.</p>
        <button className='good-btn' >
          <Link to={'/login'}>
            Get Started
          </Link>
        </button>
      </div>
    </div>
  )
}

export default Home;