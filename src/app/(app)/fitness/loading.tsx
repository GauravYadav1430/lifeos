export default function Loading() {
  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 animate-pulse">
      <div className="space-y-4 mb-8">
        <div className="h-10 bg-white/5 rounded-lg w-1/4"></div>
        <div className="h-6 bg-white/5 rounded-lg w-1/3"></div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="col-span-1 md:col-span-2 bg-white/5 rounded-3xl h-[400px]"></div>
        <div className="col-span-1 bg-white/5 rounded-3xl h-[400px]"></div>
      </div>
    </div>
  );
}
