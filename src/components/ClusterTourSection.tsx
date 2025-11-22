"use client";

export function ClusterTourSection() {
  return (
    <div className="w-full flex justify-center py-12 sm:py-16 bg-linear-to-b from-gray-50 to-white">
      <div className="w-full max-w-5xl px-4 sm:px-6">
        {/* Section Header */}
        <div className="mb-10 sm:mb-12 text-center">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 mb-3 sm:mb-4">
            Cluster Eight Park Tour
          </h2>
          <p className="text-base sm:text-lg text-gray-600">
            Jelajahi keindahan cluster 8 Park Soreang melalui tur 3D interaktif
          </p>
        </div>

        {/* Video Container */}
        <div className="relative w-full aspect-video rounded-2xl overflow-hidden shadow-xl bg-black">
          <iframe
            width="100%"
            height="100%"
            src="https://www.youtube.com/embed/YOUR_VIDEO_ID"
            title="Cinematic 3D Tour - Cluster 8 Park Soreang"
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="w-full h-full"
          />
        </div>

        {/* Description */}
        <div className="mt-8 sm:mt-10 text-center">
          <p className="text-base text-gray-700 leading-relaxed">
            Saksikan perjalanan virtual melalui setiap sudut rumah impian Anda. Lihat desain modern, 
            fasilitas lengkap, dan lingkungan strategis yang membuat 8 Park Soreang pilihan terbaik untuk keluarga Anda.
          </p>
        </div>
      </div>
    </div>
  );
}
