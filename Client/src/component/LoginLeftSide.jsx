import React from 'react'

const LoginLeftSide = () => {
  return (
    <div className="hidden md:flex w-1/2 bg-indigo-950 relative-overflow-hidden border-r border-slate-200">
      
      <div className='relative z-10 flex flex-col item-start justify-center p-12 lg:p-20 w-full h-full '>
        <h1 className="text-4xl lg:text-5xl font-medium text-white md-6 leading-tight tracking-tight">
            Employee 
            <br/> Management System
        </h1>
        <p className='text-amber-100'>
            Strime line yours workforce operation track attendence , manage payroll , and empower your team securely.
        </p>
      </div>
    </div>
  )
}

export default LoginLeftSide
