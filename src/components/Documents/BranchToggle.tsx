import React from "react";
import { Building } from "lucide-react";
import { UserBranch } from "../../types/auth";

interface BranchToggleProps {
  selectedBranch: UserBranch;
  onBranchChange: (branch: UserBranch) => void;
}

const BranchToggle: React.FC<BranchToggleProps> = ({
  selectedBranch,
  onBranchChange,
}) => {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <Building size={20} className="text-green-600 mr-2" />
          <span className="text-sm font-medium text-gray-700">
            Ver documentos de:
          </span>
        </div>

        <div className="flex bg-gray-100 rounded-lg p-1">
          <button
            onClick={() => onBranchChange("San Pedro")}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
              selectedBranch === "San Pedro"
                ? "bg-green-600 text-white shadow-sm"
                : "text-gray-600 hover:text-gray-800"
            }`}
          >
            San Pedro
          </button>
          <button
            onClick={() => onBranchChange("Las Quintas")}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
              selectedBranch === "Las Quintas"
                ? "bg-green-600 text-white shadow-sm"
                : "text-gray-600 hover:text-gray-800"
            }`}
          >
            Las Quintas
          </button>
        </div>
      </div>
    </div>
  );
};

export default BranchToggle;
