import React from 'react';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';
import Footer from '../components/Footer';
import Section from '../components/Section';
import '../styles/HomeLayout.css';

interface HomeLayoutProps {
  children: React.ReactNode;
}

const HomeLayout: React.FC<HomeLayoutProps> = ({ children }) => {
  return (
    <div className="main-background"> 
      <div className="main-layout">
        <Header />
        <div className="main-content">
          <Sidebar />
          <div className="page-content">
            <Section />
            {children}
          </div>
        </div>
        <Footer />
      </div>
    </div>
  );
};

export default HomeLayout;
