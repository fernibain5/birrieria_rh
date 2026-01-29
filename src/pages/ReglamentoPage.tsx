import React, { useState, useMemo } from "react";
import { FileText, Building } from "lucide-react";
import DocumentCard from "../components/Documents/DocumentCard";
import DocumentViewer from "../components/Documents/DocumentViewer";
import BranchToggle from "../components/Documents/BranchToggle";
import { reglamentoDocuments } from "../data/reglamentoDocuments";
import { Document } from "../types/documents";
import { UserBranch } from "../types/auth";
import { useAuth } from "../contexts/AuthContext";

const ReglamentoPage: React.FC = () => {
  const { isAdmin, userProfile } = useAuth();
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(
    null
  );
  const [isViewerOpen, setIsViewerOpen] = useState(false);

  // For admins: allow switching between branches, default to San Pedro
  // For non-admins: use their assigned branch, default to San Pedro if not set
  const [selectedBranch, setSelectedBranch] = useState<UserBranch>(
    isAdmin ? "San Pedro" : userProfile?.branch || "San Pedro"
  );

  // Filter documents based on user role and selected/assigned branch
  const filteredDocuments = useMemo(() => {
    if (isAdmin) {
      // Admin can see documents from the selected branch
      return reglamentoDocuments.filter(
        (doc) => doc.sucursal === selectedBranch
      );
    } else {
      // Non-admin can only see documents from their assigned branch
      const userBranch = userProfile?.branch || "San Pedro";
      return reglamentoDocuments.filter((doc) => doc.sucursal === userBranch);
    }
  }, [isAdmin, selectedBranch, userProfile?.branch]);

  const handlePreviewDocument = (document: Document) => {
    setSelectedDocument(document);
    setIsViewerOpen(true);
  };

  const handleCloseViewer = () => {
    setIsViewerOpen(false);
    setSelectedDocument(null);
  };

  const handleBranchChange = (branch: UserBranch) => {
    if (isAdmin) {
      setSelectedBranch(branch);
    }
  };

  // Determine which branch name to display in the header
  const displayBranch = isAdmin
    ? selectedBranch
    : userProfile?.branch || "San Pedro";

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center">
            <FileText className="text-green-600 mr-4" size={32} />
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Reglamento</h1>
              <div className="flex items-center mt-2 text-gray-600">
                <Building size={16} className="mr-2" />
                <span className="text-sm">
                  Sucursal {displayBranch} - Birrieria La Purisima
                </span>
                {isAdmin && (
                  <span className="ml-2 px-2 py-1 bg-blue-100 text-blue-600 rounded-full text-xs font-medium">
                    Admin
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Admin Branch Toggle */}
        {isAdmin && (
          <BranchToggle
            selectedBranch={selectedBranch}
            onBranchChange={handleBranchChange}
          />
        )}

        {/* Introduction */}
        <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-8">
          <h2 className="text-lg font-semibold text-green-800 mb-2">
            Documentos de Reglamento y Obligaciones
          </h2>
          <p className="text-green-700">
            {isAdmin
              ? `Bienvenido a la sección de reglamentos. Como administrador, puedes ver los documentos de cualquier sucursal usando el selector arriba. Actualmente visualizando: Sucursal ${selectedBranch}.`
              : `Bienvenido a la sección de reglamentos de la Sucursal ${displayBranch}. Aquí encontrarás todos los documentos que establecen las normas, procedimientos y obligaciones para cada área de trabajo.`}{" "}
            Haz clic en "Ver Documento" para acceder al contenido completo.
          </p>
        </div>

        {/* Documents Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredDocuments.map((document) => (
            <DocumentCard
              key={document.id}
              document={document}
              onPreview={handlePreviewDocument}
            />
          ))}
        </div>

        {/* No documents message */}
        {filteredDocuments.length === 0 && (
          <div className="text-center py-12">
            <FileText size={48} className="mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No hay documentos disponibles
            </h3>
            <p className="text-gray-600">
              No se encontraron documentos para la sucursal {displayBranch}.
            </p>
          </div>
        )}

        {/* Statistics */}
        <div className="mt-12 bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            Información General
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {filteredDocuments.length}
              </div>
              <div className="text-sm text-gray-600">
                Documentos Disponibles
              </div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {displayBranch}
              </div>
              <div className="text-sm text-gray-600">Sucursal</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">DOCX</div>
              <div className="text-sm text-gray-600">Formato de Archivos</div>
            </div>
          </div>
        </div>
      </div>

      {/* Document Viewer */}
      <DocumentViewer
        document={selectedDocument}
        isOpen={isViewerOpen}
        onClose={handleCloseViewer}
      />
    </div>
  );
};

export default ReglamentoPage;
