export default function Loader({ size = "md", text }) {
  const sizes = { sm: "w-5 h-5", md: "w-8 h-8", lg: "w-12 h-12" };
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-12">
      <div className={"border-4 border-primary-100 border-t-primary-500 rounded-full animate-spin " + sizes[size]} />
      {text && <p className="text-sm text-gray-500">{text}</p>}
    </div>
  );
}
