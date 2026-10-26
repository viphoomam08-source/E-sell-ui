"use client";
import { useState, useEffect } from "react";
import Image from "next/image";
import Banner from "./component/banner";
import Search from "./component/search";
import ProductCard from "./component/ProductCard";
import Shop from './component/Shop';
import Circlechat from "./component/circlechat";
import Category from "./component/Category";
import DiscountDisplay from "./component/discountDisplay";
import Footer from './component/Footer';
import Dicount from './component/dicount';
import ShortAnounce from './component/shortAnounce';
import Progress from './component/progress';
import Buyer_name from './component/buyer_name';
import Collection from "./component/collection";
import BannerPopup from "./component/bannerPopup";
import Brand from './component/brand';
import VideoReview from "./component/videoReview";
import LocationPopup from "./dashboard/component/modal/tracklocation";
import Page from './product/[id]/page';

export default function Home() {
  const [selectedSubId, setSelectedSubId] = useState(null);

  const handleOpenChat = () => {
    console.log("Chat action triggered every 2 seconds!");
  };

  useEffect(() => {
    const intervalId = setInterval(() => {
      handleOpenChat();
    }, 2000);

    return () => clearInterval(intervalId);
  }, []);

  return (
    <div className="w-full relative min-h-screen bg-slate-50 overflow-hidden font-['Kantumruy_Pro']">
      
      {/* 🌊 BACKGROUND SPLASH (ផ្ទៃខាងក្រោយរាងទឹកខៀវស្រស់ស្អាត) */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute -top-32 -left-32 w-[450px] h-[450px] sm:w-[600px] sm:h-[600px] bg-blue-500/20 rounded-[60%_40%_70%_30%/50%_60%_40%_50%] filter blur-3xl animate-pulse" />
        <div className="absolute top-36 -right-32 w-[400px] h-[400px] sm:w-[550px] sm:h-[550px] bg-sky-400/20 rounded-[40%_60%_30%_70%/60%_30%_70%_40%] filter blur-3xl" />
        <div className="absolute top-[50%] -left-20 w-[350px] h-[350px] bg-blue-600/15 rounded-[50%_50%_40%_60%/40%_60%_50%_50%] filter blur-3xl" />
      </div>

      {/* 📦 MAIN CONTENT LAYER */}
      <div className="relative z-10">
        <ShortAnounce />
        
        <div className="mx-auto w-full max-w-5xl px-4 py-4">
          <Progress />
        </div>

        <Banner />

        <VideoReview />
        <Dicount />
<Brand/>  
        <Category 

          onSelectSubcategory={(subId) => setSelectedSubId(subId)} 
          selectedSubId={selectedSubId} 
        />
<Collection/>
        <Shop />

        <ProductCard selectedSubId={selectedSubId} />
        <DiscountDisplay />
        <Circlechat />
        <Footer />
      </div>

    </div>
  );
}