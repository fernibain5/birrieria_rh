import React, { useEffect, useMemo, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import {
  closestCenter,
  DndContext,
  DragEndEvent,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  Calendar,
  FileText,
  BookOpen,
  Clock,
  GripVertical,
  LogOut,
  Network,
  ScrollText,
  Users,
  ClipboardList,
  X,
} from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";
import { getNavOrder, updateNavOrder } from "../../services/navOrderService";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

interface NavItemDef {
  name: string;
  path: string;
  icon: React.ReactNode;
  requiresManager: boolean;
}

const DEFAULT_NAV_ITEMS: NavItemDef[] = [
  {
    name: "Calendario",
    path: "/dashboard/calendario",
    icon: <Calendar size={20} />,
    requiresManager: false,
  },
  {
    name: "Minutas",
    path: "/dashboard/minutas",
    icon: <FileText size={20} />,
    requiresManager: true,
  },
  {
    name: "Historial Minutas",
    path: "/dashboard/historial-minutas",
    icon: <ClipboardList size={20} />,
    requiresManager: false,
  },
  {
    name: "Recursos",
    path: "/dashboard/recursos",
    icon: <BookOpen size={20} />,
    requiresManager: false,
  },
  {
    name: "Organigrama",
    path: "/dashboard/organigrama",
    icon: <Network size={20} />,
    requiresManager: false,
  },
  {
    name: "Reglamento y Obligaciones",
    path: "/dashboard/reglamento",
    icon: <ScrollText size={20} />,
    requiresManager: false,
  },
  {
    name: "Contratos",
    path: "/dashboard/contratos",
    icon: <ClipboardList size={20} />,
    requiresManager: true,
  },
  {
    name: "Incidencias",
    path: "/dashboard/incidencias",
    icon: <Clock size={20} />,
    requiresManager: true,
  },
  {
    name: "Usuarios",
    path: "/dashboard/usuarios",
    icon: <Users size={20} />,
    requiresManager: true,
  },
];

const DEFAULT_ORDER = DEFAULT_NAV_ITEMS.map((item) => item.path);

const mergeOrder = (storedOrder: string[]): string[] => {
  const known = new Set(DEFAULT_ORDER);
  const kept = storedOrder.filter((path) => known.has(path));
  const keptSet = new Set(kept);
  const appended = DEFAULT_ORDER.filter((path) => !keptSet.has(path));
  return [...kept, ...appended];
};

interface SortableNavItemProps {
  item: NavItemDef;
  isAdmin: boolean;
  onNavClick: () => void;
}

const SortableNavItem: React.FC<SortableNavItemProps> = ({ item, isAdmin, onNavClick }) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: item.path,
    disabled: !isAdmin,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`flex items-center gap-1 ${isDragging ? "z-30 opacity-80" : ""}`}
    >
      {isAdmin && (
        <button
          type="button"
          className="flex h-9 w-6 shrink-0 cursor-grab items-center justify-center rounded-md text-orange-100/70 hover:text-white focus:outline-none focus:ring-2 focus:ring-brand-secondary active:cursor-grabbing"
          title="Reordenar sección"
          {...attributes}
          {...listeners}
        >
          <GripVertical size={16} />
        </button>
      )}
      <NavLink
        to={item.path}
        onClick={onNavClick}
        className={({ isActive }) =>
          `flex flex-1 items-center px-4 py-3 text-sm font-medium rounded-md transition-colors duration-150 ease-in-out ${isActive
            ? "bg-brand-secondary text-white"
            : "text-orange-50 hover:bg-brand-primaryHover hover:text-white"
          }`
        }
      >
        <span className="mr-3">{item.icon}</span>
        {item.name}
      </NavLink>
    </div>
  );
};

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const { isAdmin, isManager, logout } = useAuth();
  const navigate = useNavigate();
  const [order, setOrder] = useState<string[]>(DEFAULT_ORDER);

  useEffect(() => {
    let cancelled = false;

    const loadOrder = async () => {
      try {
        const storedOrder = await getNavOrder();
        if (!cancelled && storedOrder.length > 0) {
          setOrder(mergeOrder(storedOrder));
        }
      } catch (error) {
        console.error("Error loading nav order:", error);
      }
    };

    loadOrder();

    return () => {
      cancelled = true;
    };
  }, []);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const itemsByPath = useMemo(
    () => new Map(DEFAULT_NAV_ITEMS.map((item) => [item.path, item])),
    []
  );

  const visibleItems = useMemo(
    () =>
      order
        .map((path) => itemsByPath.get(path))
        .filter((item): item is NavItemDef => Boolean(item))
        .filter((item) => (item.requiresManager ? isManager : true)),
    [order, itemsByPath, isManager]
  );

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (!isAdmin || !over || active.id === over.id) {
      return;
    }

    const oldIndex = visibleItems.findIndex((item) => item.path === active.id);
    const newIndex = visibleItems.findIndex((item) => item.path === over.id);

    if (oldIndex === -1 || newIndex === -1) {
      return;
    }

    const previousOrder = order;
    const newOrder = arrayMove(
      visibleItems.map((item) => item.path),
      oldIndex,
      newIndex
    );

    setOrder(newOrder);

    try {
      await updateNavOrder(newOrder);
    } catch (error) {
      console.error("Error saving nav order:", error);
      setOrder(previousOrder);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const handleNavClick = () => {
    onClose();
  };

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-gray-600 bg-opacity-50 md:hidden"
          onClick={onClose}
        />
      )}
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 transform transition-transform duration-300 ease-in-out md:relative md:translate-x-0 md:flex md:flex-shrink-0 ${isOpen ? "translate-x-0" : "-translate-x-full"
        }`}>
        <div className="flex flex-col w-64 bg-brand-primary border-r border-gray-200">
          <div className="flex items-center justify-between h-16 bg-brand-primaryHover px-4">
            <div className="text-lg font-bold text-white">
              Birrieria La Purisima
            </div>
            <button
              onClick={onClose}
              className="p-2 text-white rounded-md md:hidden hover:bg-brand-secondary"
            >
              <X size={20} />
            </button>
          </div>
          <div className="flex flex-col flex-1 overflow-y-auto">
            <nav className="flex-1 px-2 py-4 space-y-2">
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
              >
                <SortableContext
                  items={visibleItems.map((item) => item.path)}
                  strategy={verticalListSortingStrategy}
                >
                  {visibleItems.map((item) => (
                    <SortableNavItem
                      key={item.path}
                      item={item}
                      isAdmin={isAdmin}
                      onNavClick={handleNavClick}
                    />
                  ))}
                </SortableContext>
              </DndContext>
            </nav>
            <div className="p-4">
              <button
                onClick={handleLogout}
                className="flex items-center w-full px-4 py-3 text-sm font-medium text-orange-50 rounded-md hover:bg-brand-primaryHover hover:text-white transition-colors duration-150 ease-in-out"
              >
                <LogOut size={20} className="mr-3" />
                Cerrar Sesión
              </button>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
