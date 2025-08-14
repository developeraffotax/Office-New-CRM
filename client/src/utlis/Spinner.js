import React, { useEffect, useState } from "react";
import { ImSpinner10 } from "react-icons/im";
import { useNavigate } from "react-router-dom";

 

// export default function Spinner() {
//   const router = useNavigate();
//   const [count, setCount] = useState(3);

//   useEffect(() => {
//     const counter = setInterval(() => {
//       setCount((prevVal) => {
//         if (prevVal === 0) {
//           router("/");
//           clearInterval(counter);
//         }
//         return prevVal - 1;
//       });
//     }, 1000);

//     return () => clearInterval(counter);
//   }, [count, router]);
//   return (
//     <div className="w-full min-h-screen flex items-center justify-center ">
//       <div className="flex flex-col items-center justify-center gap-4">
//         <h1 className="text-2xl flex flex-col gap-2font-semibold text-center">
//           <span className="text-2xl text-red-500 font-bold text-center">
//             Unauthorised Access
//           </span>
//           Redirecting to you in {count} seconds
//         </h1>
//         <span>
//           <ImSpinner10 className="h-10 w-10 text-blue-500 animate-spin" />
//         </span>
//       </div>
//     </div>
//   );
// }















 

 

 
export default function Spinner({ text = "Loading..." }) {
  return (
    <div className="w-full min-h-screen flex items-center justify-center bg-transparent">
      <div className="flex flex-col items-center justify-center gap-8">
        {/* Gradient Text */}
        <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-orange-500 via-orange-700 to-orange-500 bg-clip-text text-transparent animate-pulse">
          {text}
        </h1>

        {/* Modern Spinner */}
        <div className="relative flex items-center justify-center">
          {/* Outer Gradient Ring */}
          <div className="w-20 h-20 rounded-full border-4 border-transparent animate-spin bg-transparent p-[2px]">
            <div className="w-full h-full rounded-full bg-transparent border-[6px] border-transparent border-t-gray-500 border-r-orange-500" />
          </div>

          {/* Inner Icon */}
          <div className="absolute inset-0 flex items-center justify-center">
            <ImSpinner10 className="h-8 w-8 text-orange-500 animate-spin-slow" />
          </div>

          {/* Floating Decorative Dots */}
          <span className="absolute -top-2 left-1 w-3 h-3 bg-orange-500 rounded-full animate-bounce" />
          <span className="absolute -bottom-2 right-1 w-3 h-3 bg-gray-500 rounded-full animate-bounce delay-150" />

          {/* Pulsing Glow */}
          {/* <span className="absolute inset-0 rounded-full bg-gradient-to-r from-orange-500 to-gray-400 opacity-20 blur-xl animate-ping" /> */}
        </div>

        {/* Subtext */}
        <p className="text-sm text-gray-800  animate-fade-in">
          Please wait while we prepare your experience...
        </p>
      </div>
    </div>
  );
}
