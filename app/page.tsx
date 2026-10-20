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
import ShortAnounce from './component/shortAnounce'

import BannerPopup from "./component/bannerPopup";
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
    <div className="w-full">
      <Search />
<ShortAnounce />
      <Banner />
      <VideoReview/>
      <Dicount/>

      <Category 
        onSelectSubcategory={(subId) => setSelectedSubId(subId)} 
        selectedSubId={selectedSubId} 
      />

      <Shop />

      <ProductCard selectedSubId={selectedSubId} />
      <DiscountDisplay/>
      <Circlechat unreadCount={1}/>
      <BannerPopup />
      <Footer/>
    </div>
  );
}