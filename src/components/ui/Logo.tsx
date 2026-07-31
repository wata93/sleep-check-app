export function Logo({ size = 40 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none" aria-hidden="true">
      <circle cx="24" cy="24" r="24" fill="#13213e" />
      <path
        d="M31 15a11 11 0 1 0 3 15.6A9 9 0 0 1 31 15Z"
        fill="#eef6ff"
      />
      <circle cx="34" cy="14" r="1.6" fill="#eef6ff" />
      <circle cx="38" cy="20" r="1.1" fill="#eef6ff" />
      <circle cx="30" cy="10" r="1" fill="#eef6ff" />
    </svg>
  );
}
