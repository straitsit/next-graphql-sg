import React from 'react';
import Link from 'next/link';

const Navbar = (props) => {
  return <>
    <nav className="mx-auto px-4 bg-gray-700 flex">
        <div className="text-gray-300 text-2xl p-4"><Link href="/">LOGO</Link></div>
        <div className="text-gray-300 text-2xl p-4 ml-auto"><Link href="/login">LOGIN</Link></div>
    </nav>
  </>
};

export default Navbar;
