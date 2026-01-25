import React, { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import Button from "@/components/ui/Button";
import { Icon } from "@iconify/react";

const AuthWelcomeSection = ({ className, classNamediv }) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const router = useRouter();

  const slides = [
    {
      id: 1,
      title: "Your Complete Life Data in One App",
      subtitle: "Welcome to VLife",
      description:
        "Connect to all your apps and see all your data and charts in one integrated dashboard",
    },
    {
      id: 2,
      title: "Track Your Progress Effortlessly",
      subtitle: "Welcome to VLife",
      description:
        "Monitor your daily activities, habits and achievements with beautiful visualizations",
    },
    {
      id: 3,
      title: "Secure & Private Data Storage",
      subtitle: "Welcome to VLife",
      description:
        "Your personal information is encrypted and stored securely with industry-standard protection",
    },
    {
      id: 4,
      title: "Smart Insights & Analytics",
      subtitle: "Welcome to VLife",
      description:
        "Get personalized recommendations and insights based on your data patterns",
    },
    {
      id: 5,
      title: "Seamless Integration with App",
      subtitle: "Welcome to VLife",
      description:
        "Connect with your favorite apps and services to centralize all your data",
    },
    {
      id: 6,
      title: "Start Your Journey Today",
      subtitle: "Welcome to VLife",
      description:
        "Join thousands of users who have already transformed their data experience",
    },
  ];

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  const skipSlides = () => {
    // Mark welcome screen as visited in localStorage when skipping
    if (typeof window !== 'undefined') {
      localStorage.setItem('welcomeScreen', 'false');
    }
    setCurrentSlide(slides.length - 1);
  };

  const goToSlide = (index) => {
    setCurrentSlide(index);
  };

  const handleGoToLogin = () => {
    // Mark welcome screen as visited in localStorage
    if (typeof window !== 'undefined') {
      localStorage.setItem('welcomeScreen', 'false');
    }
    router.push("/login");
  };

  const currentSlideData = slides[currentSlide];
  const isLastSlide = currentSlide === slides.length - 1;

  return (
    <div className=" lg:flex lg:flex-1 lg:items-center lg:justify-center relative overflow-hidden h-screen">
      <div
        className={`relative overflow-hidden w-full h-full bg-[#4289E6]  ${classNamediv}`}
        style={{
            opacity: 1,
          transform: "rotate(0deg)",
        }}
      >
        <div className="flex flex-col items-center text-center px-6 xl:py-20 py-8 h-full justify-between relative">
          {/* Header Section */}
          <div className="flex-shrink-0">
            <h1 className="text-xl xl:text-4xl font-bold text-white mb-3 transition-opacity duration-500">
              {currentSlideData.subtitle}
            </h1>
            <h2 className="text-base xl:text-lg font-medium text-white mb-2 transition-opacity duration-500">
              {currentSlideData.title}
            </h2>
            <p
              className="text-sm xl:text-base text-white/90 max-w-lg mx-auto leading-relaxed transition-opacity duration-500"
              style={{ fontWeight: 400 }}
            >
              {currentSlideData.description}
            </p>
          </div>

          {/* Main Image */}
          <div className="flex-1 flex items-center justify-center min-h-0 py-4">
            <Image
              src="/images/illustrations/auth-screen-image.png"
              alt="Vlife Dashboard Preview"
              width={500}
              height={350}
              className="w-full "
              priority
            />
          </div>

          {/* Pagination Dots */}
          <div className="flex items-center space-x-3 flex-shrink-0 mb-6">
            {slides.map((_, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                className={`transition-all duration-300 rounded-full ${index === currentSlide
                  ? "w-8 h-3 bg-white"
                  : "w-3 h-3 bg-white/30 hover:bg-white/50"
                  }`}
              />
            ))}
          </div>

          {/* Bottom Buttons */}
          {!isLastSlide ? (
            <>
              <div className={`flex items-center justify-end w-full gap-4 px-4 mb-4 ${className}`}>
                <button
                  onClick={skipSlides}
                  className="backdrop-blur-md bg-white/20 text-white font-medium px-6 py-2.5 rounded-full border border-white/30 hover:bg-white/30 transition-all duration-300 flex items-center gap-2 shadow-lg"
                >
                  <Icon icon="mdi:skip-next-outline" className="w-5 h-5" />
                  Skip
                </button>

                <button
                  onClick={nextSlide}
                  className="backdrop-blur-md bg-gradient-to-r from-white/20 to-white/10 text-white font-semibold px-8 py-2.5 rounded-full border border-white/30 hover:bg-white/30 hover:scale-105 transition-all duration-300 flex items-center gap-2 shadow-lg"
                >
                  Next
                  <Icon icon="mdi:arrow-right" className="w-5 h-5" />
                </button>


              </div>
            </>
          ) : (
            <div className={`flex items-center justify-center w-full gap-20 px-4 mb-4 ${className}`}>

              <button
                onClick={handleGoToLogin}
                className="bg-white text-[#4289E6] px-8 py-3 rounded-full font-semibold hover:bg-white/90 transition shadow-lg"
              >
              Lets Start →
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AuthWelcomeSection;
