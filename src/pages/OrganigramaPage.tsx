import React, { ChangeEvent, useEffect, useRef, useState } from "react";
import { AlertCircle, ImagePlus, Loader2, Network, Trash2, Upload } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { deleteOrgChart, getOrgChart, uploadOrgChart } from "../services/organigramaService";
import { OrgChart } from "../types/orgChart";

const OrganigramaPage: React.FC = () => {
  const { isAdmin } = useAuth();
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [orgChart, setOrgChart] = useState<OrgChart | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const loadOrgChart = async () => {
    try {
      setLoading(true);
      setError("");
      const current = await getOrgChart();
      setOrgChart(current);
    } catch (err) {
      console.error("Error loading org chart:", err);
      setError("Error al cargar el organigrama. Por favor, intenta nuevamente.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrgChart();
  }, []);

  const handleFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] || null;
    event.target.value = "";
    if (!file) return;

    try {
      setSaving(true);
      setError("");
      const updated = await uploadOrgChart(file);
      setOrgChart(updated);
    } catch (err) {
      console.error("Error uploading org chart:", err);
      setError("Error al subir el organigrama. Verifica el archivo e intenta nuevamente.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!orgChart) return;
    const confirmed = window.confirm("¿Eliminar el organigrama actual?");
    if (!confirmed) return;

    try {
      setSaving(true);
      setError("");
      await deleteOrgChart();
      setOrgChart(null);
    } catch (err) {
      console.error("Error deleting org chart:", err);
      setError("Error al eliminar el organigrama. Por favor, intenta nuevamente.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex h-full flex-col">
      <div className="mb-6 flex items-center justify-between gap-4">
        <div className="flex items-center">
          <Network className="text-brand-secondary mr-4" size={32} />
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Organigrama</h1>
            <p className="text-gray-600 mt-1">Estructura organizacional del equipo</p>
          </div>
        </div>

        {isAdmin && orgChart && (
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={saving}
              className="btn border border-brand-primary text-brand-primary hover:bg-gray-50 flex items-center gap-2"
            >
              {saving ? <Loader2 size={16} className="animate-spin" /> : <Upload size={16} />}
              Reemplazar
            </button>
            <button
              type="button"
              onClick={handleDelete}
              disabled={saving}
              className="btn flex items-center gap-2 border border-red-200 text-red-600 hover:bg-red-50"
            >
              <Trash2 size={16} />
              Eliminar
            </button>
          </div>
        )}
      </div>

      {error && (
        <div className="mb-6 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-red-700">
          <div className="flex items-center">
            <AlertCircle size={18} className="mr-2 shrink-0" />
            <span>{error}</span>
          </div>
        </div>
      )}

      {isAdmin && (
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="hidden"
        />
      )}

      {loading ? (
        <div className="flex flex-1 items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-secondary mx-auto"></div>
            <p className="mt-4 text-gray-600">Cargando organigrama...</p>
          </div>
        </div>
      ) : orgChart ? (
        <div className="flex-1 min-h-0 rounded-lg border border-gray-200 bg-white flex items-center justify-center overflow-hidden">
          <img
            src={orgChart.fileUrl}
            alt="Organigrama de la empresa"
            className="max-w-full max-h-full object-contain"
          />
        </div>
      ) : (
        <div className="flex flex-1 flex-col items-center justify-center rounded-lg bg-white shadow-sm py-14 px-6 text-center">
          <ImagePlus size={42} className="mx-auto text-gray-300 mb-4" />
          <h2 className="text-lg font-semibold text-gray-900 mb-2">
            No hay organigrama disponible
          </h2>
          <p className="text-gray-600 mb-6">
            {isAdmin
              ? "Sube una imagen para mostrar el organigrama de la empresa."
              : "El organigrama aún no ha sido publicado."}
          </p>
          {isAdmin && (
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={saving}
              className="btn btn-primary flex items-center gap-2"
            >
              {saving ? <Loader2 size={18} className="animate-spin" /> : <Upload size={18} />}
              {saving ? "Subiendo..." : "Subir organigrama"}
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default OrganigramaPage;
