const Logo = ({ className = "w-auto h-8" }) => {
  return (
    <div className={`flex items-center ${className}`}>
      {/* Simple green leaf logo similar to the image */}
      <svg 
        width="30" 
        height="30" 
        viewBox="0 0 30 30" 
        className="mr-2"
      >
        <path 
          d="M6 20C6 20 3 16 3 10.5C3 5 9 5 13 10C17 15 21 17 27 16C27 21 21.5 26 14.5 25.5C9.5 25.2 6.8 21 6 20Z" 
          fill="#3D8B37"
        />
        <path 
          d="M15 11C15 11 18 16 18 20.5" 
          stroke="#2A6329" 
          strokeWidth="1.2" 
          strokeLinecap="round"
        />
      </svg>

      <span className="text-xl font-bold text-[#4CAF50]">UrbanFood</span>
    </div>
  );
};

export default Logo;