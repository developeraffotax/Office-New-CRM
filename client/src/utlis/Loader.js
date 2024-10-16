import React from "react";
import Skeleton, { SkeletonTheme } from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";

export default function Loader() {
  return (
    <div className="w-full min-h-[60vh]">
      <div className="w-full h-full">
        <SkeletonTheme baseColor="#ccc" highlightColor="#777">
          <p>
            <Skeleton
              count={10}
              height={60}
              width="100%"
              className="animate-pulse"
            />
          </p>
        </SkeletonTheme>
      </div>
    </div>
  );
}
