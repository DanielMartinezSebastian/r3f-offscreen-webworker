"use client";
import dynamic from "next/dynamic";
const OffScreenCanvas = dynamic(() => import("@/components/OffScreenCanvas"), {
  ssr: false,
});

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen overflow-hidden">
      <OffScreenCanvas />
    </div>
  );
}
