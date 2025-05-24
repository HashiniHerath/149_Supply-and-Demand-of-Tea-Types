import React, { useState } from "react";
import { AiOutlineMenu, AiOutlineClose } from "react-icons/ai";
import "./nav.css";
import { Link } from "react-router-dom";

export default function Nav() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="header">
      {/* Menu Icon */}
      <div className="menu-icon" onClick={() => setMenuOpen(!menuOpen)}>
        {menuOpen ? <AiOutlineClose size={30} /> : <AiOutlineMenu size={30} />}
      </div>

      {/* Dropdown Menu */}
      <div className={`dropdown-menu ${menuOpen ? "open" : ""}`}>
        <div className="menu-logo">
          <Link to={'/welcome'}><img src={`${process.env.PUBLIC_URL}/images/logo.png`} alt="Logo" /></Link>
        </div>
        <nav className="menu-links">
          <Link to="/services" onClick={() => setMenuOpen(false)}>Services</Link>
          <Link to="/about" onClick={() => setMenuOpen(false)}>About Us</Link>
          {/* <a href="#contact" onClick={() => setMenuOpen(false)}>Contact</a> */}
        </nav>
      </div>
    </div>
  );
}
