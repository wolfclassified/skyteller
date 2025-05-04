import React from 'react';
import Daily from '../component/Daily';
import Hourly from '../component/Hourly';
import Stats from '../component/Stats';
import Sun from '../component/Sun';
import Map from '../component/Map';
import Logo from '/assets/logodark.svg';

const RightSec = () => {
  return (
    <div className="flex-1 w-full p-4 relative mt-4 mr-4">
      {/* Top-right toggle */}
      {/* <div className="absolute top-4 right-4 z-10 mr-6">
        <Toggle />
      </div> */}

      {/* Top bar */}
      <div className="flex items-center space-x-2 mb-6 px-6">
        <img className='w-20 sm:w-28 md:w-36 lg:w-44 xl:w-52 h-auto' src={Logo} alt="Logo" />
      </div>

      {/* Daily Cards */}
      <Daily />

      {/* Hourly Cards */}
      <Hourly />

      {/* Stats component under Hourly, aligned to the left */}
      <div className="mt-6 ml-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Left section for Stats */}
          <div className="w-full">
            <Stats />
          </div>
         {/* Right section: Two Sun components stacked */}
         <div className="flex flex-col gap-4">
            <Sun />
            <Map/>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RightSec;