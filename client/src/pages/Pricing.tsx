import React from 'react'
import { appPlans } from '../assets/assets';

interface Plan {
  id: string;
  price: string;
  credits: string;
  description: string;
  features: string[];
}
const Pricing = () => {
    const [plans] = React.useState<Plan[]>(appPlans)
  return (
    <>
      <div className='w-full max-w-5x1 mx-auto z-20 max-md:px-4 min-h-[80vh]'>
        <div className='text-center mt-16'>
           <h2 className='text-gray-100 text-3x1 font-medium'>Choose Your Plan</h2>
           <p className='text-gray-400 text-sm max-w-md mx-auto mt-2'>Start for
            free and scale up as you grow. Find the perfect plan for your content
            creation needs.</p>
        </div>
      </div>
    </>
  )
}

export default Pricing