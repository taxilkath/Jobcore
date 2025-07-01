import React from 'react';
import { useNavigate } from 'react-router-dom';
import HeroSection from '../components/HeroSection';
import SocialProofSection from '../components/SocialProofSection';

const HomePage: React.FC = () => {
  const navigate = useNavigate();

  const handleSearch = (searchData: any) => {
    // This will be handled by navigating to the jobs page with search params
    console.log('Search triggered from home:', searchData);
    navigate('/jobs');
  };

  return (
    <>
      <HeroSection onSearch={handleSearch} />
      <SocialProofSection />
    </>
  );
};

export default HomePage; 