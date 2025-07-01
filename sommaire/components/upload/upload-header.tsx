import { Badge } from "@/components/ui/badge";
import { Sparkles } from "lucide-react";

export default function UploadHeader() {
  return (
    <div className="flex flex-col items-center justify-center gap-6 text-center">
      <div className="relative p-[1px] overflow-hidden rounded-full  bg-rose-50 text-white bg-linear-to-r from-rose-200 via-rose-500 to-rose-800 animate-gradient-x group">
        <Badge
          variant={"secondary"}
          className="relative px-6 py-2 text-base font-medium bg-white rounded-full group-hover:bg-rose-200 transition-colors"
        >
          <Sparkles className="h-6 w-6 lg:w-8 lg:h-8 scale-150 animate-pulse mr-2 text-rose-600" />
          <p className="text-base">AI-Powered Content Creation</p>
        </Badge>
      </div>

      <div className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
        Start Uploading{" "}
        <span className="relative inline-block">
          <span className="relative z-10 px-2">Your PDF's</span>
          <span
            className="absolute inset-0 bg-rose-200/50 -rotate-2 rounded-lg transform -skew-y-1"
            aria-hidden="true"
          ></span>
        </span>
      </div>

      <div className="mt-2 text-lg font-semibold leading-8 text-gray-600 max-w-2xl text-center">
        <p>Upload your PDF and let our AI do the magic!✨</p>
      </div>
    </div>
  );
}
