import React, { useState, useRef, useEffect } from 'react';
import { X, Share2, Heart, Star, ChevronDown, Check, MousePointer2, Settings2, User, Shirt } from 'lucide-react';
import { GeneratedImage } from '../types';

interface MockupModalProps {
   image: GeneratedImage | null;
   onClose: () => void;
}

const SIZES = ['S', 'M', 'L', 'XL', '2XL'];
const MOCKUP_TYPES = [
   { id: 'man', label: 'Man', image: '/mockup-base.png' },
   { id: 'woman', label: 'Woman', image: '/mockup-woman.png' },
   { id: 'kid', label: 'Kid', image: '/mockup-kid.png' },
];
const COLORS = [
   { id: 'white', label: 'White', hex: '#FFFFFF' },
   { id: 'black', label: 'Black', hex: '#000000' },
   { id: 'navy', label: 'Navy', hex: '#1E3A8A' },
   { id: 'red', label: 'Red', hex: '#DC2626' },
   { id: 'green', label: 'Green', hex: '#059669' },
   { id: 'purple', label: 'Purple', hex: '#9333EA' },
];

const MockupModal: React.FC<MockupModalProps> = ({ image, onClose }) => {
   const [selectedSize, setSelectedSize] = useState('L');
   const [isClosing, setIsClosing] = useState(false);
   const [isVisible, setIsVisible] = useState(false);
   const [mockupType, setMockupType] = useState('man');
   const [selectedColor, setSelectedColor] = useState('white');
   const [height, setHeight] = useState(85); // Percentage
   const [isDragging, setIsDragging] = useState(false);
   const modalRef = useRef<HTMLDivElement>(null);

   // Trigger entrance animation
   useEffect(() => {
      if (image) {
         // Small delay to ensure DOM is ready
         setTimeout(() => setIsVisible(true), 10);
      }
   }, [image]);

   // Drag to resize logic
   useEffect(() => {
      const handleMouseMove = (e: MouseEvent) => {
         if (!isDragging) return;
         const newHeight = ((window.innerHeight - e.clientY) / window.innerHeight) * 100;
         if (newHeight > 40 && newHeight < 98) {
            setHeight(newHeight);
         }
      };

      const handleMouseUp = () => {
         setIsDragging(false);
      };

      if (isDragging) {
         window.addEventListener('mousemove', handleMouseMove);
         window.addEventListener('mouseup', handleMouseUp);
      }

      return () => {
         window.removeEventListener('mousemove', handleMouseMove);
         window.removeEventListener('mouseup', handleMouseUp);
      };
   }, [isDragging]);

   if (!image) return null;

   const handleClose = () => {
      setIsVisible(false);
      setIsClosing(true);
      setTimeout(() => {
         setIsClosing(false);
         onClose();
      }, 400);
   };

   const currentMockup = MOCKUP_TYPES.find(t => t.id === mockupType) || MOCKUP_TYPES[0];

   return (
      <div className="fixed inset-0 z-50 flex items-end justify-center">
         {/* Backdrop */}
         <div
            className={`absolute inset-0 bg-black/80 backdrop-blur-sm transition-all duration-500 ease-out ${isVisible ? 'opacity-100' : 'opacity-0'}`}
            onClick={handleClose}
         />

         {/* Modal Content - Bottom Sheet */}
         <div
            ref={modalRef}
            style={{ height: `${height}vh` }}
            className={`relative w-full bg-[#09090b] rounded-t-[2rem] overflow-hidden shadow-2xl transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] transform ${isVisible ? 'translate-y-0 opacity-100 scale-100' : 'translate-y-full opacity-0 scale-95'} border-t border-white/10 flex flex-col`}
         >
            {/* Drag Handle */}
            <div
               className={`w-full h-6 absolute top-0 left-0 z-30 flex items-center justify-center cursor-ns-resize hover:bg-white/5 transition-all group ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2'}`}
               style={{ transitionDelay: '100ms', transitionDuration: '400ms' }}
               onMouseDown={() => setIsDragging(true)}
            >
               <div className="w-12 h-1.5 bg-zinc-700 rounded-full group-hover:bg-zinc-500 transition-colors"></div>
            </div>

            {/* Close Button */}
            <button
               onClick={handleClose}
               className={`absolute top-6 right-6 z-20 p-2 bg-white/5 hover:bg-white/10 rounded-full text-zinc-400 hover:text-white transition-all ${isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-75'}`}
               style={{ transitionDelay: '150ms', transitionDuration: '400ms' }}
            >
               <X size={24} />
            </button>

            <div className="flex-1 flex flex-col md:flex-row overflow-hidden pt-6">
               {/* Left Side - Visuals (Mockup Canvas) */}
               <div className={`flex-1 bg-[#09090b] relative flex items-start justify-center p-4 md:p-8 border-b md:border-b-0 md:border-r border-white/5 overflow-y-auto custom-scrollbar transition-all ${isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-8'}`}
                  style={{ transitionDelay: '200ms', transitionDuration: '500ms' }}
               >
                  {/* Mockup Container */}
                  <div className="relative w-full max-w-md aspect-[3/4] bg-[#18181b] rounded-2xl overflow-hidden shadow-2xl border border-white/5 my-auto">
                     <img
                        src={currentMockup.image}
                        alt={`${currentMockup.label} Hoodie Mockup`}
                        className="w-full h-full object-cover opacity-80"
                     />

                     {/* Overlay Generated Image */}
                     <div className="absolute top-[35%] left-1/2 -translate-x-1/2 w-[32%] aspect-square mix-blend-overlay opacity-90 pointer-events-none">
                        <img
                           src={image.url}
                           alt="Design"
                           className="w-full h-full object-contain filter contrast-125 brightness-110"
                        />
                     </div>

                     {/* Settings Overlay */}
                     <div className="absolute top-4 left-4 flex flex-col gap-2">
                        <div className="group relative">
                           <button className="p-2 bg-black/50 backdrop-blur text-white rounded-lg hover:bg-black/70 transition-colors border border-white/10">
                              <User size={18} />
                           </button>
                           {/* Dropdown */}
                           <div className="absolute top-full left-0 mt-2 w-32 bg-[#18181b] border border-white/10 rounded-xl shadow-xl overflow-hidden hidden group-hover:block animate-in fade-in zoom-in-95 z-40">
                              {MOCKUP_TYPES.map(type => (
                                 <button
                                    key={type.id}
                                    onClick={() => setMockupType(type.id)}
                                    className={`w-full text-left px-4 py-2 text-sm hover:bg-white/5 transition-colors ${mockupType === type.id ? 'text-indigo-400' : 'text-zinc-400'}`}
                                 >
                                    {type.label}
                                 </button>
                              ))}
                           </div>
                        </div>
                        <button className="p-2 bg-black/50 backdrop-blur text-white rounded-lg hover:bg-black/70 transition-colors border border-white/10" title="Change Apparel (Coming Soon)">
                           <Shirt size={18} />
                        </button>
                     </div>
                  </div>
               </div>

               {/* Right Side - Product Details */}
               <div className={`w-full md:w-[500px] bg-[#09090b] h-full flex flex-col overflow-y-auto custom-scrollbar transition-all ${isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-8'}`}
                  style={{ transitionDelay: '300ms', transitionDuration: '500ms' }}
               >
                  <div className="p-8 md:p-10 space-y-8">
                     {/* Header */}
                     <div>
                        <div className="flex items-center gap-2 text-xs font-medium text-zinc-500 mb-4 uppercase tracking-wider">
                           <span>Apparel</span>
                           <span className="text-zinc-700">/</span>
                           <span className="text-zinc-300">Limited Edition</span>
                        </div>
                        <h1 className="text-2xl md:text-3xl font-bold text-white mb-2 tracking-tight leading-tight">
                           {image.prompt.split(' ').slice(0, 6).join(' ')}...
                        </h1>
                        <div className="flex items-center justify-between">
                           <span className="text-xl font-medium text-indigo-400">Rs. 5,000</span>
                           <div className="flex items-center gap-1 text-yellow-500 text-xs">
                              <Star size={14} fill="currentColor" />
                              <Star size={14} fill="currentColor" />
                              <Star size={14} fill="currentColor" />
                              <Star size={14} fill="currentColor" />
                              <Star size={14} fill="currentColor" />
                              <span className="text-zinc-500 ml-2">(128 Reviews)</span>
                           </div>
                        </div>
                     </div>

                     {/* Color Selector */}
                     <div>
                        <label className="text-sm font-medium text-zinc-300 mb-3 block">Select Color</label>
                        <div className="flex gap-3 flex-wrap">
                           {COLORS.map(color => (
                              <button
                                 key={color.id}
                                 onClick={() => setSelectedColor(color.id)}
                                 className={`group relative`}
                                 title={color.label}
                              >
                                 <div
                                    className={`w-10 h-10 rounded-xl border-2 transition-all ${selectedColor === color.id ? 'border-white scale-110 shadow-lg' : 'border-zinc-700 hover:border-zinc-500'}`}
                                    style={{ backgroundColor: color.hex }}
                                 />
                                 {selectedColor === color.id && (
                                    <div className="absolute inset-0 flex items-center justify-center">
                                       <div className="w-3 h-3 bg-white rounded-full border border-black/20" />
                                    </div>
                                 )}
                              </button>
                           ))}
                        </div>
                     </div>

                     {/* Size Selector */}
                     <div>
                        <div className="flex justify-between items-center mb-3">
                           <label className="text-sm font-medium text-zinc-300">Select Size</label>
                           <button className="text-xs text-zinc-500 hover:text-white transition-colors">Size Guide</button>
                        </div>
                        <div className="flex gap-3">
                           {SIZES.map(size => (
                              <button
                                 key={size}
                                 onClick={() => setSelectedSize(size)}
                                 className={`w-12 h-12 rounded-xl flex items-center justify-center text-sm font-medium transition-all border ${selectedSize === size
                                    ? 'bg-white text-black border-white scale-105'
                                    : 'bg-transparent text-zinc-500 border-zinc-800 hover:border-zinc-600 hover:text-zinc-300'
                                    }`}
                              >
                                 {size}
                              </button>
                           ))}
                        </div>
                     </div>

                     {/* Actions */}
                     <div className="flex gap-3">
                        <button className="flex-1 bg-indigo-600 text-white h-12 rounded-xl font-semibold text-base hover:bg-indigo-500 transition-all flex items-center justify-center gap-2 shadow-lg shadow-indigo-500/20">
                           Order Now
                        </button>
                        <button className="w-12 h-12 flex items-center justify-center rounded-xl border border-zinc-800 text-zinc-400 hover:text-white hover:bg-white/5 transition-colors">
                           <Heart size={20} />
                        </button>
                        <button className="w-12 h-12 flex items-center justify-center rounded-xl border border-zinc-800 text-zinc-400 hover:text-white hover:bg-white/5 transition-colors">
                           <Share2 size={20} />
                        </button>
                     </div>

                     {/* Description */}
                     <div className="pt-6 border-t border-white/5">
                        <h3 className="text-sm font-medium text-white mb-2">Description</h3>
                        <p className="text-zinc-400 text-sm leading-relaxed">
                           Experience the fusion of AI artistry and premium streetwear. This hoodie features a unique design generated by Gemini 2.5, printed on high-quality heavyweight cotton.
                        </p>
                     </div>

                     {/* People Also Bought */}
                     <div className="pt-6 border-t border-white/5">
                        <h3 className="text-sm font-medium text-white mb-4">People Also Bought</h3>
                        <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
                           {[1, 2, 3].map((i) => (
                              <div key={i} className="min-w-[120px] space-y-2 group cursor-pointer">
                                 <div className="aspect-[3/4] bg-zinc-900 rounded-lg overflow-hidden border border-white/5">
                                    <div className="w-full h-full bg-zinc-800 animate-pulse group-hover:bg-zinc-700 transition-colors"></div>
                                 </div>
                                 <div className="space-y-1">
                                    <div className="h-3 w-20 bg-zinc-800 rounded"></div>
                                    <div className="h-3 w-12 bg-zinc-800 rounded"></div>
                                 </div>
                              </div>
                           ))}
                        </div>
                     </div>

                     {/* Reviews Preview */}
                     <div className="pt-6 border-t border-white/5">
                        <h3 className="text-sm font-medium text-white mb-4">Recent Reviews</h3>
                        <div className="space-y-4">
                           <div className="bg-white/5 p-4 rounded-xl border border-white/5">
                              <div className="flex items-center justify-between mb-2">
                                 <span className="text-xs font-bold text-white">Alex M.</span>
                                 <div className="flex text-yellow-500"><Star size={10} fill="currentColor" /><Star size={10} fill="currentColor" /><Star size={10} fill="currentColor" /><Star size={10} fill="currentColor" /><Star size={10} fill="currentColor" /></div>
                              </div>
                              <p className="text-xs text-zinc-400">"The print quality is insane! Looks exactly like the generated image."</p>
                           </div>
                        </div>
                     </div>
                  </div>
               </div>
            </div>
         </div>
      </div>
   );
};

export default MockupModal;
