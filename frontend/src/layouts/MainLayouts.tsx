import Header from '../components/Header';
import Sidebar from '../components/Sidebar';
import Section from '../components/Section';
import Footer from '../components/Footer';
import '../styles/MainLayout.css';

const MainLayout = ({ children }: { children: React.ReactNode }) => (
  <>
    <Header />
    <div className="container">
      <Sidebar />
      <Section />
      {children}
    </div>
    <Footer />
  </>
);

export default MainLayout;
