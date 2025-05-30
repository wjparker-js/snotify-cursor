
import { useEffect } from 'react';

export function useHideAddressBar() {
  useEffect(() => {
    // Function to hide the address bar
    const hideAddressBar = () => {
      // If loaded on a mobile device
      if (window.navigator.userAgent.match(/Mobile|Android|iPhone|iPad|iPod/i)) {
        // Wait for everything to load
        setTimeout(() => {
          // For iOS Safari
          if (navigator.userAgent.match(/iPhone|iPad|iPod/i)) {
            window.scrollTo(0, 1);
            
            // Add resize listener for orientation changes
            const handleResize = () => {
              setTimeout(() => window.scrollTo(0, 1), 100);
            };
            
            window.addEventListener('resize', handleResize);
            return () => window.removeEventListener('resize', handleResize);
          } 
          // For Chrome on Android
          else if (navigator.userAgent.match(/Chrome/i) && navigator.userAgent.match(/Android/i)) {
            // Try to use the fullscreen API for Chrome
            const docElement = document.documentElement;
            
            if (docElement.requestFullscreen) {
              docElement.requestFullscreen()
                .catch(err => {
                  console.log("Fullscreen request failed, using fallback method");
                  // Fallback to traditional method
                  forceScrollHideAddressBar();
                });
            } else {
              // Fallback for browsers that don't support fullscreen API
              forceScrollHideAddressBar();
            }
          }
          // For other mobile browsers
          else {
            forceScrollHideAddressBar();
          }
        }, 300);
      }
    };
    
    // Helper function for traditional address bar hiding
    const forceScrollHideAddressBar = () => {
      // Set body to be slightly taller than viewport
      document.body.style.height = "calc(100vh + 200px)";
      
      // Force scroll down then reset height
      setTimeout(() => {
        window.scrollTo(0, 1);
        
        // After scroll, reset the body height
        setTimeout(() => {
          document.body.style.height = "100%";
        }, 100);
      }, 50);
    };

    // Hide address bar on page load
    hideAddressBar();
    
    // Re-hide when coming back to the page
    window.addEventListener('pageshow', hideAddressBar);
    window.addEventListener('focus', hideAddressBar);
    
    // Re-hide when screen orientation changes
    window.addEventListener('orientationchange', () => {
      setTimeout(hideAddressBar, 100);
    });
    
    // Clean up
    return () => {
      window.removeEventListener('pageshow', hideAddressBar);
      window.removeEventListener('focus', hideAddressBar);
      window.removeEventListener('orientationchange', () => {
        setTimeout(hideAddressBar, 100);
      });
    };
  }, []);
}
