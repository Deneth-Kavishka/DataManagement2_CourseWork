import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

// Add Font Awesome
const fontAwesomeLink = document.createElement('link');
fontAwesomeLink.rel = 'stylesheet';
fontAwesomeLink.href = 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css';
document.head.appendChild(fontAwesomeLink);

// Add Google Fonts
const googleFontLink = document.createElement('link');
googleFontLink.rel = 'stylesheet';
googleFontLink.href = 'https://fonts.googleapis.com/css2?family=Open+Sans:wght@400;500;600&family=Poppins:wght@400;500;600;700&display=swap';
document.head.appendChild(googleFontLink);

createRoot(document.getElementById("root")!).render(<App />);
