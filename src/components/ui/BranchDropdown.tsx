import React, { useEffect, useRef, useState } from "react";
import { Building, ChevronDown } from "lucide-react";
import { UserBranch } from "../../types/auth";

const BRANCHES: UserBranch[] = ["San Pedro", "Las Quintas"];

interface BranchDropdownProps {
  selectedBranch: UserBranch;
  onBranchChange: (branch: UserBranch) => void;
}

const BranchDropdown: React.FC<BranchDropdownProps> = ({
  selectedBranch,
  onBranchChange,
}) => {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-semibold text-gray-800 shadow-sm transition-colors hover:bg-gray-50 focus:outline-none"
      >
        <Building size={18} className="text-brand-primary shrink-0" />
        <span>{selectedBranch}</span>
        <ChevronDown
          size={16}
          className={`text-gray-500 transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open && (
        <div className="absolute left-0 top-full z-50 mt-1 w-44 rounded-lg border border-gray-200 bg-white py-1 shadow-lg">
          {BRANCHES.map((branch) => (
            <button
              key={branch}
              type="button"
              onClick={() => {
                onBranchChange(branch);
                setOpen(false);
              }}
              className={`flex w-full items-center gap-2 px-4 py-2.5 text-sm transition-colors ${
                selectedBranch === branch
                  ? "bg-brand-primary text-white font-semibold"
                  : "text-gray-700 hover:bg-gray-100"
              }`}
            >
              <Building size={14} className="shrink-0" />
              {branch}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default BranchDropdown;
