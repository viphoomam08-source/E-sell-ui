import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { Clock, CheckCircle2, Truck, PackageCheck, ChevronRight, Star, Check } from 'lucide-react';

// Import រូបភាព e.png ពី app/image/e.png
import logoImage from '@/app/image/e.png';

export default function Progress() {
  const [currentStep, setCurrentStep] = useState<number>(2);
  const [showPopup, setShowPopup] = useState<boolean>(false);
  const [rating, setRating] = useState<number>(5);
  const [review, setReview] = useState<string>('');
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);

  const steps = [
    { id: 1, title: 'Pending', description: 'រង់ចាំពិនិត្យ', icon: Clock },
    { id: 2, title: 'Confirmed', description: 'បានបញ្ជាក់', icon: CheckCircle2 },
    { id: 3, title: 'Shipping', description: 'កំពុងដឹកជញ្ជូន', icon: Truck },
    { id: 4, title: 'Delivered', description: 'បានប្រគល់', icon: PackageCheck },
  ];

  const progressWidth = ((currentStep - 1) / (steps.length - 1)) * 100;

  // 🔊 មុខងារសម្រាប់លេងសំឡេង (Sound Effect Helper)
  const playSound = (type: 'click' | 'success') => {
    try {
      const audioPath = type === 'success' 
        ? 'https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3' 
        : 'https://assets.mixkit.co/active_storage/sfx/2568/2568-preview.mp3';
        
      const audio = new Audio(audioPath);
      audio.volume = 0.4;
      audio.play().catch((e) => console.log("Audio play blocked by browser:", e));
    } catch (error) {
      console.log("Audio error:", error);
    }
  };

  const handleNextStep = () => {
    if (currentStep < steps.length) {
      const nextStep = currentStep + 1;
      setCurrentStep(nextStep);
      if (nextStep === 4) {
        playSound('success');
      } else {
        playSound('click');
      }
    }
  };

  const handlePrevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
      playSound('click');
    }
  };

  // ⏳ រង់ចាំឱ្យ Animation រត់ដល់ 100% (Step 4) សិន ទើបបង្ហាញ Popup
  useEffect(() => {
    if (currentStep === 4) {
      const timer = setTimeout(() => {
        setShowPopup(true);
      }, 800); 
      return () => clearTimeout(timer);
    } else {
      setShowPopup(false);
    }
  }, [currentStep]);

  const handleSubmitReview = (e: React.FormEvent) => {
    e.preventDefault();
    playSound('success');
    setIsSubmitted(true);
  };

  return (
    <div className="w-full mx-auto font-['Kantumruy_Pro'] transition-all duration-500 ease-in-out">
      
      {/* 1. Progress Bar Container */}
      {!showPopup && (
        <div className="w-full p-4 sm:p-6 bg-white rounded-2xl shadow-sm border border-gray-100 transition-all duration-500">
          
          {/* Header Info & Controls */}
          <div className="flex items-center justify-between gap-4 mb-6 pb-3 border-b border-gray-100">
            <div>
              <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
                <span className="w-2 h-5 bg-blue-600 rounded-full"></span>
                ស្ថានភាពការបញ្ជាទិញ (Order Tracking)
              </h3>
              <p className="text-[11px] text-gray-400 mt-0.5">Order ID: #ORD-2026-98241</p>
            </div>

            {/* Test Trigger Buttons with Sound */}
            <div className="flex items-center gap-1.5">
              <button 
                disabled={currentStep === 1}
                onClick={handlePrevStep}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-gray-100 text-gray-600 hover:bg-gray-200 disabled:opacity-40 cursor-pointer transition"
              >
                ថយក្រោយ
              </button>
              <button 
                disabled={currentStep === steps.length}
                onClick={handleNextStep}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-40 cursor-pointer transition flex items-center gap-1 shadow-sm"
              >
                <span>បន្ទាប់</span>
                <ChevronRight size={14} />
              </button>
            </div>
          </div>

          {/* Progress Steps Container */}
          <div className="relative my-6 px-3 sm:px-6">
            
            {/* Background Grey Line */}
            <div className="absolute top-1/3 left-0 w-full h-1.5 bg-gray-200 -translate-y-1/2 rounded-full z-0" />

            {/* Smooth Animated Active Line */}
            <div 
              className="absolute top-1/3 left-0 h-1.5 bg-gradient-to-r from-yellow-400 via-blue-500 to-blue-600 -translate-y-1/2 rounded-full z-0 transition-all duration-700 ease-in-out"
              style={{ width: `${progressWidth}%` }}
            />

            {/* 🎯 Custom Logo (e.png) ដើរតាម Progress Line (ទំហំធំល្មម មើលឃើញច្បាស់) */}
            <div 
              className="absolute top-1/3 -translate-y-1/2 z-20 transition-all duration-700 ease-in-out"
              style={{ left: `calc(${progressWidth}% - 24px)` }}
            >
              <div className="w-12 h-12 rounded-full bg-white border-2 border-blue-500 shadow-lg flex items-center justify-center overflow-hidden p-1 animate-bounce">
                <Image 
                  src={logoImage} 
                  alt="Custom Logo" 
                  width={44} 
                  height={44} 
                  className="w-full h-full object-contain"
                />
              </div>
            </div>

            {/* Step Circles */}
            <div className="relative z-10 flex justify-between items-center w-full">
              {steps.map((step) => {
                const Icon = step.icon;
                const isCompleted = step.id < currentStep;
                const isCurrent = step.id === currentStep;

                return (
                  <div 
                    key={step.id} 
                    className="flex flex-col items-center group cursor-pointer" 
                    onClick={() => {
                      setCurrentStep(step.id);
                      playSound('click');
                    }}
                  >
                    <div 
                      className={`w-10 h-10 sm:w-11 sm:h-11 rounded-xl flex items-center justify-center transition-all duration-500 ease-in-out border shadow-xs ${
                        isCurrent
                          ? 'bg-amber-400 border-amber-300 text-slate-900 scale-105 shadow-md shadow-amber-400/30 animate-pulse'
                          : isCompleted
                          ? 'bg-blue-600 border-blue-600 text-white scale-100'
                          : 'bg-white border-gray-200 text-gray-400'
                      }`}
                    >
                      <Icon className={`w-5 h-5 transition-transform duration-300 ${isCurrent ? 'scale-110' : ''}`} />
                    </div>

                    <div className="text-center mt-2">
                      <p className={`text-xs sm:text-sm font-bold transition-colors duration-300 ${
                        isCurrent ? 'text-amber-600' : isCompleted ? 'text-blue-600' : 'text-gray-400'
                      }`}>
                        {step.title}
                      </p>
                      <p className="text-[10px] text-gray-400 font-medium hidden sm:block mt-0.5">
                        {step.description}
                      </p>
                    </div>

                  </div>
                );
              })}
            </div>

          </div>

        </div>
      )}

      {/* 2. Delivered Popup Modal */}
      {showPopup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-sm p-4 transition-all duration-300">
          <div className="bg-white w-full max-w-sm rounded-3xl shadow-2xl overflow-hidden border border-gray-100 p-6 relative">
            
            {!isSubmitted ? (
              <div className="text-center">
                <div className="w-14 h-14 bg-emerald-50 text-emerald-600 rounded-2xl border border-emerald-100 flex items-center justify-center mx-auto mb-3 shadow-sm">
                  <PackageCheck size={28} />
                </div>
                
                <h3 className="text-lg font-bold text-gray-900">Your product has been delivered!</h3>
                <p className="text-xs text-gray-400 mt-1">Please rate your experience with us.</p>

                <form onSubmit={handleSubmitReview} className="space-y-4 mt-4">
                  {/* Rating Stars */}
                  <div className="flex justify-center gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        type="button"
                        key={star}
                        onClick={() => { setRating(star); playSound('click'); }}
                        className="cursor-pointer transition-transform hover:scale-110"
                      >
                        <Star 
                          size={26} 
                          className={`${star <= rating ? 'fill-amber-400 text-amber-400' : 'text-gray-300'}`} 
                        />
                      </button>
                    ))}
                  </div>

                  {/* Review Textarea */}
                  <textarea 
                    rows={2}
                    value={review}
                    onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setReview(e.target.value)}
                    placeholder="Write a quick review..."
                    className="w-full p-3 text-xs border border-gray-200 rounded-xl focus:outline-none focus:border-blue-600 bg-gray-50 resize-none"
                  ></textarea>

                  {/* Action Buttons */}
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => { setShowPopup(false); setCurrentStep(3); playSound('click'); }}
                      className="w-1/3 py-2 rounded-xl text-xs font-semibold bg-gray-100 text-gray-600 hover:bg-gray-200 transition cursor-pointer"
                    >
                      Close
                    </button>
                    <button
                      type="submit"
                      className="w-2/3 py-2 rounded-xl text-xs font-bold bg-blue-600 text-white hover:bg-blue-700 shadow-md transition cursor-pointer flex items-center justify-center gap-1"
                    >
                      <Check size={16} /> Submit
                    </button>
                  </div>
                </form>
              </div>
            ) : (
              <div className="text-center py-4 space-y-2">
                <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto">
                  <Check size={24} />
                </div>
                <h4 className="text-base font-bold text-gray-900">Thank you for your feedback!</h4>
                <button 
                  onClick={() => { setIsSubmitted(false); setShowPopup(false); setCurrentStep(1); playSound('click'); }}
                  className="mt-3 px-5 py-2 bg-blue-600 text-white text-xs font-semibold rounded-xl hover:bg-blue-700 transition cursor-pointer"
                >
                  Done
                </button>
              </div>
            )}

          </div>
        </div>
      )}

    </div>
  );
}