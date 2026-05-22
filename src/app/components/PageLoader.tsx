import { useEffect, useState } from "react";
import { useLocation, useNavigation } from "react-router";

export function PageLoader() {
  const location = useLocation();
  const navigation = useNavigation();
  const [progress, setProgress] = useState(0);
  const [visible, setVisible] = useState(false);
  const [isSlow, setIsSlow] = useState(false);

  useEffect(() => {
    // Whenever location path changes, simulate a fast route loading progress
    setVisible(true);
    setIsSlow(false);
    setProgress(15);

    // Initial rapid jump
    const timer1 = setTimeout(() => {
      setProgress((prev) => Math.max(prev, 45));
    }, 80);

    // Secondary jump
    const timer2 = setTimeout(() => {
      setProgress((prev) => Math.max(prev, 75));
    }, 220);

    // Show a gentle spinner if navigation takes longer than 400ms (simulated or real)
    const slowTimer = setTimeout(() => {
      setIsSlow(true);
    }, 400);

    // Complete the progress after 450ms for smooth instantaneous feedback
    const timer3 = setTimeout(() => {
      setProgress(100);
      const fadeTimer = setTimeout(() => {
        setVisible(false);
        setProgress(0);
        setIsSlow(false);
      }, 150);
      return () => clearTimeout(fadeTimer);
    }, 450);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
      clearTimeout(slowTimer);
    };
  }, [location.pathname]);

  // Support actual async loaders if they exist in the router
  useEffect(() => {
    if (navigation.state === "loading") {
      setVisible(true);
      setProgress((prev) => Math.max(prev, 30));
      const slowTimer = setTimeout(() => {
        setIsSlow(true);
      }, 400);
      return () => clearTimeout(slowTimer);
    } else if (navigation.state === "idle" && progress > 0) {
      setProgress(100);
      const timer = setTimeout(() => {
        setVisible(false);
        setProgress(0);
        setIsSlow(false);
      }, 150);
      return () => clearTimeout(timer);
    }
  }, [navigation.state]);

  if (!visible) return null;

  return (
    <>
      {/* Sleek Top Progress Bar */}
      <div
        className="fixed top-0 left-0 right-0 z-[9999] pointer-events-none"
        style={{ height: "3px" }}
      >
        <div
          className="h-full bg-gradient-to-r from-teal-accent via-gold-accent to-sage-green transition-all duration-300 ease-out"
          style={{
            width: `${progress}%`,
            boxShadow: "0 0 10px var(--teal-accent), 0 0 5px var(--teal-accent)",
          }}
        />
      </div>

      {/* Subtle Screen Overlay & Spinner if loading is taking a bit longer */}
      {isSlow && (
        <div className="fixed inset-0 z-[9998] flex items-center justify-center bg-dark-olive/20 backdrop-blur-[2px] transition-opacity duration-300 pointer-events-none">
          <div className="bg-[#1e241e]/90 border border-teal-accent/20 rounded-2xl p-5 shadow-2xl flex flex-col items-center gap-3 animate-pulse pointer-events-auto">
            <div className="relative w-10 h-10">
              {/* Outer Golden Spinner */}
              <div className="absolute inset-0 rounded-full border-2 border-teal-accent/20 border-t-teal-accent animate-spin" />
              {/* Inner Olive Spinner */}
              <div className="absolute inset-1 rounded-full border-2 border-olive-green/20 border-b-olive-green animate-spin [animation-direction:reverse] [animation-duration:1s]" />
            </div>
            <span className="text-xs font-display text-teal-accent tracking-widest uppercase">
              Loading...
            </span>
          </div>
        </div>
      )}
    </>
  );
}
