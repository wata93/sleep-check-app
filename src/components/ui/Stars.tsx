export function Stars({ count, max = 5 }: { count: number; max?: number }) {
  return (
    <div className="flex items-center justify-center gap-1" aria-label={`5段階中${count}`}>
      {Array.from({ length: max }).map((_, i) => (
        <svg
          key={i}
          viewBox="0 0 24 24"
          className={`h-7 w-7 sm:h-8 sm:w-8 ${i < count ? "text-amber-400" : "text-navy-100"}`}
          fill="currentColor"
          aria-hidden="true"
        >
          <path d="M12 2.5l2.9 6.02 6.6.82-4.86 4.6 1.27 6.56L12 17.6l-5.91 3.9 1.27-6.56-4.86-4.6 6.6-.82L12 2.5z" />
        </svg>
      ))}
    </div>
  );
}
