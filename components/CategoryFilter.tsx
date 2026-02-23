"use client";

interface CategoryFilterProps {
  value: string;
  onChange: (value: string) => void;
  categories: string[];
}

export default function CategoryFilter({ value, onChange, categories }: CategoryFilterProps) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="px-3 py-1.5 rounded-lg border border-[var(--border-color)] bg-[var(--background)] text-sm"
    >
      {categories.map((c) => (
        <option key={c} value={c}>
          {c === "all" ? "All Categories" : c.charAt(0).toUpperCase() + c.slice(1)}
        </option>
      ))}
    </select>
  );
}
