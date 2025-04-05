import { Link } from "react-router-dom";

const Logo = ({ className = "w-auto h-8" }) => {
  return (
    <div className={`flex items-center ${className}`}>
      <i className="fas fa-leaf text-primary text-2xl mr-2"></i>
      <span className="text-xl font-bold text-[#4CAF50]">UrbanFood</span>
    </div>
  );
};

export default Logo;
