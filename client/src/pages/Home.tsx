import { useEffect } from "react";
import { AppLayout } from "../components/layout";
import { useAppDispatch, useAppSelector } from "../hooks/useAppStore";
import { fetchFeaturedHotels, fetchDestinations } from "../app/store/hotelSlice";

import { HeroSection } from "../features/hotel/components/home/HeroSection";
import { TrendingDestinations } from "../features/hotel/components/home/TrendingDestinations";
import { SpecialDeals } from "../features/hotel/components/home/SpecialDeals";
import { FeaturedHotels } from "../features/hotel/components/home/FeaturedHotels";

export const Home = () => {
  const dispatch = useAppDispatch();

  const { isAuthenticated } = useAppSelector((state) => state.auth);
  const { featuredHotels, isFeaturedLoading, destinations, isDestinationsLoading } =
    useAppSelector((state) => state.hotel);

  useEffect(() => {
    dispatch(fetchDestinations(4));
    if (isAuthenticated) dispatch(fetchFeaturedHotels(10));
  }, [dispatch, isAuthenticated]);

  return (
    <AppLayout withContainer={false}>
      <HeroSection />

      <main className="page-container py-24 space-y-24">
        <TrendingDestinations 
          destinations={destinations} 
          isLoading={isDestinationsLoading} 
        />
        
        <SpecialDeals />
        
        <FeaturedHotels 
          hotels={featuredHotels} 
          isLoading={isFeaturedLoading} 
          isAuthenticated={isAuthenticated} 
        />
      </main>
    </AppLayout>
  );
};
