import React from 'react';
import { useNavigate } from 'react-router-dom';
import HeroSection from '../components/HeroSection';
import SocialProofSection from '../components/SocialProofSection';

const HomePage: React.FC = () => {
  const navigate = useNavigate();

  const handleSearch = (searchData: any) => {
    // Navigate to jobs page with search parameters
    console.log('Search triggered from home:', searchData);
    const searchParams = new URLSearchParams();
    
    if (searchData.searchTerm) {
      searchParams.set('query', searchData.searchTerm);
    }
    if (searchData.location) {
      searchParams.set('location', searchData.location);
    }
    
    navigate(`/jobs?${searchParams.toString()}`);
  };

  return (
    <>
      <HeroSection onSearch={handleSearch} />
      <SocialProofSection />
    </>
  );
};

export default HomePage; 