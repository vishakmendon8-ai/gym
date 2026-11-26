import React, { useState, useRef, useEffect } from 'react';
import { 
  CreditCard, 
  CalendarCheck, 
  Bell, 
  User 
} from 'lucide-react';
import { MemberScreen } from './MemberApp';

export interface LiquidBottomDockProps {
  activeTab: 'home' | 'plans' | 'attendance' | 'notifications' | 'profile';
  onNavigate: (screen: MemberScreen) => void;
}

export const LiquidBottomDock: React.FC<LiquidBottomDockProps> = ({ 
  activeTab, 
  onNavigate 
}) => {
  const tabOrder = ['home', 'plans', 'attendance', 'notifications', 'profile'] as const;
  const activeIndex = tabOrder.indexOf(activeTab) >= 0 ? tabOrder.indexOf(activeTab) : 0;

  const [glidingState, setGlidingState] = useState<{
    isGliding: boolean;
    direction: 'right' | 'left' | null;
    distance: number;
    duration: number;
  }>({
    isGliding: false,
    direction: null,
    distance: 0,
    duration: 440
  });

  const [tapBounce, setTapBounce] = useState(false);
  const [rippleIndex, setRippleIndex] = useState<number | null>(null);

  const activeTimersRef = useRef<number[]>([]);

  const clearAllTimers = () => {
    activeTimersRef.current.forEach(id => clearTimeout(id));
    activeTimersRef.current = [];
  };

  useEffect(() => {
    return () => clearAllTimers();
  }, []);

  const handleTabClick = (screen: MemberScreen, targetIndex: number) => {
    clearAllTimers();

    if (targetIndex !== activeIndex) {
      const direction: 'right' | 'left' = targetIndex > activeIndex ? 'right' : 'left';
      const distance = Math.abs(targetIndex - activeIndex);
      // Dynamic duration based on distance: longer travels stretch more visibly across the dock
      const duration = 380 + distance * 45; // e.g. 425ms (1 tab) to 560ms (4 tabs)

      setGlidingState({
        isGliding: true,
        direction,
        distance,
        duration
      });
      setRippleIndex(targetIndex);

      const t1 = window.setTimeout(() => {
        setGlidingState(prev => ({ ...prev, isGliding: false, direction: null }));
      }, duration);

      const t2 = window.setTimeout(() => {
        setRippleIndex(null);
      }, duration + 200);

      activeTimersRef.current.push(t1, t2);
    } else {
      // In-place tap on active tab -> trigger jelly elastic squish
      setTapBounce(true);
      setRippleIndex(targetIndex);

      const t3 = window.setTimeout(() => setTapBounce(false), 440);
      const t4 = window.setTimeout(() => setRippleIndex(null), 500);
      activeTimersRef.current.push(t3, t4);
    }

    onNavigate(screen);
  };

  const navItems = [
    {
      id: 'home' as const,
      label: 'Home',
      targetScreen: 'home' as MemberScreen,
      icon: (active: boolean) => (
        <svg 
          className={`w-[22px] h-[22px] transition-all duration-300 ${
            active 
              ? 'text-[#252A30] scale-110 drop-shadow-xs' 
              : 'text-[#84909A] [@media(hover:hover)]:group-hover:text-[#252A30]'
          }`} 
          viewBox="0 0 24 24" 
          fill={active ? '#252A30' : 'none'} 
          stroke="currentColor" 
          strokeWidth="2.2"
        >
          <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
        </svg>
      )
    },
    {
      id: 'plans' as const,
      label: 'Membership',
      targetScreen: 'plans' as MemberScreen,
      icon: (active: boolean) => (
        <CreditCard 
          className={`w-[22px] h-[22px] transition-all duration-300 ${
            active 
              ? 'text-[#252A30] scale-110 drop-shadow-xs' 
              : 'text-[#84909A] [@media(hover:hover)]:group-hover:text-[#252A30]'
          }`} 
          strokeWidth={active ? 2.4 : 2.1} 
        />
      )
    },
    {
      id: 'attendance' as const,
      label: 'Attendance',
      targetScreen: 'attendance' as MemberScreen,
      icon: (active: boolean) => (
        <CalendarCheck 
          className={`w-[22px] h-[22px] transition-all duration-300 ${
            active 
              ? 'text-[#252A30] scale-110 drop-shadow-xs' 
              : 'text-[#84909A] [@media(hover:hover)]:group-hover:text-[#252A30]'
          }`} 
          strokeWidth={active ? 2.4 : 2.1} 
        />
      )
    },
    {
      id: 'notifications' as const,
      label: 'Notifications',
      targetScreen: 'notifications' as MemberScreen,
      hasBadge: true,
      icon: (active: boolean) => (
        <Bell 
          className={`w-[22px] h-[22px] transition-all duration-300 ${
            active 
              ? 'text-[#252A30] scale-110 drop-shadow-xs' 
              : 'text-[#84909A] [@media(hover:hover)]:group-hover:text-[#252A30]'
          }`} 
          strokeWidth={active ? 2.4 : 2.1} 
        />
      )
    },
    {
      id: 'profile' as const,
      label: 'Profile',
      targetScreen: 'profile' as MemberScreen,
      icon: (active: boolean) => (
        <User 
          className={`w-[22px] h-[22px] transition-all duration-300 ${
            active 
              ? 'text-[#252A30] scale-110 drop-shadow-xs' 
              : 'text-[#84909A] [@media(hover:hover)]:group-hover:text-[#252A30]'
          }`} 
          strokeWidth={active ? 2.4 : 2.1} 
        />
      )
    }
  ];

  return (
    <div className="fixed bottom-4 inset-x-0 mx-auto max-w-[390px] px-3 z-50 pointer-events-auto">
      {/* Outer Floating Dock Slot */}
      <div 
        className="bg-white/98 backdrop-blur-2xl rounded-[34px] px-2 py-2 border border-slate-200/90 shadow-[0_12px_40px_rgba(37,42,48,0.16),0_2px_8px_rgba(37,42,48,0.06)] relative overflow-hidden select-none"
        style={{ touchAction: 'manipulation' }}
      >
        {/* Unified Nav Container: Sliding Glass Box and Buttons share exact relative coordinate system */}
        <div className="relative w-full">
          
          {/* ========================================================= */}
          {/* TRAVELING LIQUID GLASS BOX INDICATOR (Exact 1/5 slot width) */}
          {/* ========================================================= */}
          <div 
            className="absolute top-0 bottom-0 w-1/5 pointer-events-none z-0"
            style={{
              transform: `translateX(${activeIndex * 100}%)`,
              transition: `transform ${glidingState.duration}ms cubic-bezier(0.34, 1.42, 0.64, 1)`
            }}
          >
            <div className="w-full h-full flex flex-col items-center justify-start pt-0.5">
              
              {/* Animated Glass Box Container with Directional Liquid Stretch & Jelly Bounce */}
              <div 
                className={`relative flex items-center justify-center transition-all ${
                  glidingState.isGliding
                    ? glidingState.direction === 'right'
                      ? 'animate-liquid-travel-right'
                      : 'animate-liquid-travel-left'
                    : tapBounce
                      ? 'animate-liquid-jelly-tap'
                      : 'transition-transform duration-300'
                }`}
                style={{
                  // @ts-ignore
                  '--glide-ms': `${glidingState.duration}ms`
                }}
              >
                {/* 1. Outer Translucent Liquid Glass Halo (Matches media_1795581897529_13ed373e.png) */}
                <div className="absolute -inset-1 rounded-[22px] bg-[#FFD447]/30 blur-[2.5px] pointer-events-none -z-10 shadow-[0_4px_22px_rgba(255,212,71,0.6)]" />

                {/* 2. Sunshine Yellow Glossy Glass Box Squircle */}
                <div className="w-[48px] h-[48px] rounded-[18px] bg-gradient-to-b from-[#FFE776] via-[#FFD447] to-[#F5BE18] border-[1.5px] border-[#FFF8B8]/95 shadow-[0_6px_16px_rgba(255,212,71,0.52),_inset_0_2px_4px_rgba(255,255,255,0.92),_inset_0_-2.5px_4px_rgba(180,115,0,0.35)] relative overflow-hidden flex items-center justify-center">
                  
                  {/* 3. Glossy Specular Highlight Pill at Top (Matches exact curvature in reference image) */}
                  <div className="absolute top-[3px] left-[7px] right-[7px] h-[9px] rounded-full bg-gradient-to-b from-white/95 via-white/70 to-white/10 shadow-[0_1px_2px_rgba(255,255,255,0.7)] pointer-events-none" />

                  {/* 4. Subtle Inner Caustic Reflection at Bottom-Right */}
                  <div className="absolute bottom-1 right-2.5 w-3.5 h-1.5 rounded-full bg-white/30 blur-[0.4px] pointer-events-none" />
                </div>
              </div>

            </div>
          </div>

          {/* ========================================================= */}
          {/* 5-COLUMN INTERACTIVE BUTTON GRID                          */}
          {/* ========================================================= */}
          <nav aria-label="Member Navigation" className="relative z-10 grid grid-cols-5 items-center w-full">
            {navItems.map((item, idx) => {
              const isActive = activeTab === item.id;
              const hasRipple = rippleIndex === idx;

              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    handleTabClick(item.targetScreen, idx);
                  }}
                  onTouchStart={(e) => {
                    if (e.touches && e.touches.length > 1) {
                      e.preventDefault();
                    }
                  }}
                  className="flex flex-col items-center justify-center gap-1 w-full py-0.5 relative group cursor-pointer outline-none select-none active:scale-95 transition-transform duration-150"
                  style={{
                    WebkitTapHighlightColor: 'transparent',
                    touchAction: 'manipulation'
                  }}
                  title={item.label}
                >
                  {/* Fluid Droplet Splash Ripple on Tab Landing */}
                  {hasRipple && (
                    <span className="absolute top-1 w-12 h-12 rounded-[20px] bg-[#FFD447]/40 animate-liquid-splash pointer-events-none -z-0" />
                  )}

                  {/* Icon Container: Exactly 48px height, perfectly concentric with the traveling glass box */}
                  <div className="relative w-full h-[48px] flex items-center justify-center pointer-events-none">
                    <div className={`transition-all duration-300 flex items-center justify-center ${
                      isActive 
                        ? (glidingState.isGliding ? 'animate-liquid-pop' : 'scale-105') 
                        : 'scale-100 [@media(hover:hover)]:group-hover:scale-105'
                    }`}>
                      {item.icon(isActive)}
                    </div>

                    {item.hasBadge && (
                      <span className="absolute top-2 right-3 w-2.5 h-2.5 rounded-full bg-[#E5484D] border-2 border-white shadow-xs" />
                    )}
                  </div>

                  {/* Label: Fixed slot width, bold graphite when active */}
                  <span className={`text-[10px] tracking-tight transition-all duration-300 truncate w-full text-center px-0.5 pointer-events-none select-none ${
                    isActive 
                      ? 'font-bold text-[#252A30] scale-105' 
                      : 'font-medium text-[#84909A] [@media(hover:hover)]:group-hover:text-[#252A30]'
                  }`}>
                    {item.label}
                  </span>
                </button>
              );
            })}
          </nav>

        </div>
      </div>
    </div>
  );
};
