
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { useHideAddressBar } from './hooks/use-hide-address-bar'

// Wrapper component to apply the hooks
const AppWithHooks = () => {
  // Apply address bar hiding hook
  useHideAddressBar();
  
  return <App />;
};

// Root element to render into
const rootElement = document.getElementById("root");
if (!rootElement) {
  console.error("Root element not found!");
} else {
  console.log("Root element found, rendering app");
  createRoot(rootElement).render(<AppWithHooks />);
}
