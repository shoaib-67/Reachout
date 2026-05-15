import React from "react";

function Footer() {
  return (
    <footer className="site-footer">
      <div className="container footer-inner">
        <p>Copyright &copy; 2024-{new Date().getFullYear()} ReachOut. All Rights Reserved</p>
      </div>
    </footer>
  );
}

export default Footer;
