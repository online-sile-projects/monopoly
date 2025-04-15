import React from 'react';
import '../assets/styles/Footer.css';

const Footer = () => {
  return (
    <footer className="game-footer">
      <div className="footer-content">
        <div className="copyright">
          © {new Date().getFullYear()} 大富翁遊戲 - 純前端實作
        </div>
        <div className="footer-info">
          <span>使用 React 開發</span>
          <span>·</span>
          <span>版本 1.0.0</span>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
