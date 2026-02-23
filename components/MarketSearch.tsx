"use client";

interface MarketSearchProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export default function MarketSearch({
  value,
  onChange,
  placeholder = "Search markets...",
  className = "",
}: MarketSearchProps) {
  return (
    <input
      type="text"
      placeholder={placeholder}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={`w-full max-w-md ${className}`}
    />
  );
}
