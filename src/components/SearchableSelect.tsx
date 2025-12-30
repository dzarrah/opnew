import React, { useState, useRef, useEffect, useMemo } from "react";

interface Option {
  id: string | number;
  label: string;
  subLabel?: string;
}

interface SearchableSelectProps {
  options: Option[];
  value: string | number;
  onChange: (value: string | number) => void;
  placeholder?: string;
  label?: string;
  className?: string;
}

const SearchableSelect: React.FC<SearchableSelectProps> = ({
  options,
  value,
  onChange,
  placeholder = "Pilih...",
  label,
  className = "",
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const wrapperRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find((opt) => String(opt.id) === String(value));

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Filter options
  const filteredOptions = useMemo(() => {
    const query = search.toLowerCase();
    if (!query) return options;
    return options.filter((opt) =>
      (opt.label || "").toLowerCase().includes(query) ||
      (opt.subLabel && (opt.subLabel || "").toLowerCase().includes(query))
    );
  }, [options, search]);

  return (
    <div className={`relative ${className}`} ref={wrapperRef}>
      {label && (
        <label className="text-xs font-bold text-gray-500 dark:text-[#9db4b9] mb-1 block">
          {label} :
        </label>
      )}
      <div
        className="w-full bg-gray-50 dark:bg-[#101f22] border border-gray-200 dark:border-[#283639] rounded-lg px-3 py-2 text-sm text-gray-900 dark:text-white focus-within:ring-1 focus-within:ring-primary cursor-pointer flex justify-between items-center"
        onClick={() => {
          setIsOpen(!isOpen);
          if (!isOpen) setSearch(""); // Reset search on open
        }}
      >
        <span className={!selectedOption ? "text-gray-400" : ""}>
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <span className="material-symbols-outlined text-[18px] text-gray-400">
          arrow_drop_down
        </span>
      </div>

      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-white dark:bg-[#1c2527] border border-gray-200 dark:border-[#283639] rounded-lg shadow-xl max-h-60 overflow-hidden flex flex-col">
          <div className="p-2 border-b border-gray-100 dark:border-[#283639]">
            <input
              type="text"
              className="w-full bg-gray-50 dark:bg-[#101f22] border border-gray-200 dark:border-[#283639] rounded px-2 py-1.5 text-xs text-gray-900 dark:text-white outline-none focus:border-primary"
              placeholder="Cari..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              autoFocus
              onClick={(e) => e.stopPropagation()}
            />
          </div>
          <div className="overflow-y-auto flex-1">
            {filteredOptions.length > 0 ? (
              filteredOptions.map((opt) => (
                <div
                  key={opt.id}
                  className={`px-3 py-2 text-sm cursor-pointer hover:bg-gray-50 dark:hover:bg-[#283639] flex flex-col ${String(opt.id) === String(value) ? "bg-primary/10 text-primary" : "text-gray-700 dark:text-gray-300"
                    }`}
                  onClick={() => {
                    onChange(opt.id);
                    setIsOpen(false);
                  }}
                >
                  <span className="font-medium">{opt.label}</span>
                  {opt.subLabel && (
                    <span className="text-[10px] text-gray-400">{opt.subLabel}</span>
                  )}
                </div>
              ))
            ) : (
              <div className="px-3 py-4 text-xs text-center text-gray-400 italic">
                Tidak ditemukan
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchableSelect;
