"use client";

'use client'

import { useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Thumbs, Navigation, Pagination, Autoplay } from "swiper/modules";
import SwiperCore from "swiper";
import Image from "next/image";

import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import "swiper/css/thumbs";

const data = [
  {
    img: "/swiper/sijalak-harupat.jpeg",
    title: "Stadion Si Jalak Harupat",
  },
  {
    img: "/swiper/ciwidey.jpg",
    title: "Wisata Ciwidey",
  },
  {
    img: "/swiper/exit-tol-soroja.webp",
    title: "Exit Tol Soroja",
  },
  {
    img: "/swiper/rsud-ottista.jpeg",
    title: "RSUD Oto Iskandar Dinata",
  },
  {
    img: "/swiper/Kantor-Bupati.jpg",
    title: "Kantor Bupati Bandung",
  },
];

export function AksesibilitasSlider() {
  const [thumbsSwiper, setThumbsSwiper] = useState<SwiperCore | null>(null);

  return (
    <div className="w-full flex justify-center py-8 sm:py-12 bg-white">
      <div className="w-full max-w-4xl px-4 sm:px-6">
        {/* Section Header */}
        <div className="mb-8 sm:mb-10 text-center">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 mb-3 sm:mb-4">
            Aksesibilitas Cluster 8 Park Soreang
          </h2>
          <p className="text-base sm:text-lg text-gray-600">
            Lokasi Strategis dengan akses mudah ke berbagai fasilitas dan pusat kota
          </p>
        </div>

        {/* HERO SLIDER */}
        <Swiper
          modules={[Navigation, Pagination, Thumbs, Autoplay]}
          thumbs={{ swiper: thumbsSwiper }}
          navigation={true}
          pagination={{ clickable: true }}
          loop={true}
          autoplay={{ delay: 5000, disableOnInteraction: true }}
          className="rounded-xl sm:rounded-2xl overflow-hidden shadow-md sm:shadow-lg will-change-transform"
          speed={700}
          watchSlidesProgress={true}
        >
          {data.map((item, i) => (
            <SwiperSlide key={i}>
              <div className="relative">
                <Image
                  src={item.img}
                  width={1200}
                  height={600}
                  alt={item.title}
                  className="w-full h-60 sm:h-[300px] md:h-[340px] object-cover"
                  loading="lazy"
                  quality={75}
                />
                <div className="absolute bottom-0 left-0 right-0 bg-linear-to-t from-black/70 via-black/10 to-transparent px-4 sm:px-6 py-3 sm:py-5">
                  <h2 className="text-white text-base sm:text-lg md:text-xl font-bold drop-shadow-xl">
                    {item.title}
                  </h2>
                </div>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>

        {/* THUMBNAIL GRID SLIDER */}
        <Swiper
          modules={[Thumbs]}
          onSwiper={setThumbsSwiper}
          slidesPerView={3}
          breakpoints={{
            640: { slidesPerView: 4 },
            1024: { slidesPerView: 5 },
          }}
          spaceBetween={8}
          watchSlidesProgress={true}
          className="mt-3 sm:mt-4"
          speed={500}
        >
          {data.map((item, i) => (
            <SwiperSlide key={i}>
              <div className="rounded-lg overflow-hidden shadow-sm hover:ring-2 hover:ring-gray-400 transition-all duration-200 cursor-pointer">
                <Image
                  src={item.img}
                  width={300}
                  height={200}
                  alt={item.title}
                  className="w-full h-[70px] sm:h-20 object-cover"
                  loading="lazy"
                  quality={60}
                />
              </div>
            </SwiperSlide>
          ))}
        </Swiper>

        {/* Background Section - Simplified to Gradient */}
        <div className="mt-12 sm:mt-16 w-full min-h-[450px] sm:min-h-[550px] lg:min-h-[620px] bg-linear-to-br from-slate-100 to-slate-200 relative rounded-lg"
        >
        </div>

        {/* Video Grid Overlay - Positioned below section */}
        <div className="relative w-full flex justify-center px-4 sm:px-6 -mt-48 sm:-mt-56 lg:-mt-64 pb-24 sm:pb-32">
          <div className="w-full max-w-[1300px]">
            <div className="rounded-lg overflow-hidden shadow-2xl hover:shadow-2xl transition-shadow duration-300 cursor-pointer bg-gray-800 aspect-video">
              <iframe
                className="w-full h-full"
                src="https://www.youtube.com/embed/CFN5sjGKt1E?controls=1&modestbranding=1&rel=0"
                title="8 Park Soreang - Lokasi & Fasilitas"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>

            {/* Navigation Dots */}
            <div className="flex justify-center gap-2 mt-6 sm:mt-8">
              <button className="w-3 h-3 sm:w-4 sm:h-4 rounded-full bg-gray-400/80 hover:bg-gray-600 transition-all" />
              <button className="w-3 h-3 sm:w-4 sm:h-4 rounded-full bg-gray-300/50 hover:bg-gray-500 transition-all" />
              <button className="w-3 h-3 sm:w-4 sm:h-4 rounded-full bg-gray-300/50 hover:bg-gray-500 transition-all" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
