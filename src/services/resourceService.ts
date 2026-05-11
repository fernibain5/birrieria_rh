import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  serverTimestamp,
  writeBatch,
} from "firebase/firestore";
import {
  deleteObject,
  getDownloadURL,
  ref,
  uploadBytes,
} from "firebase/storage";
import { db, storage } from "../firebase/config";
import { CreateResourceData, Resource } from "../types/resource";

const RESOURCES_COLLECTION = "resources";

const sanitizeFileName = (fileName: string) =>
  fileName
    .trim()
    .replace(/[^\w.\-() ]+/g, "_")
    .replace(/\s+/g, "_");

const getSortableOrder = (resource: Resource) =>
  Number.isFinite(resource.order) && resource.order > 0
    ? resource.order
    : Number.MAX_SAFE_INTEGER;

const getErrorDetails = (error: unknown) => {
  const firebaseError = error as {
    code?: unknown;
    customData?: unknown;
    name?: unknown;
    serverResponse?: unknown;
  };

  return {
    code: firebaseError.code,
    customData: firebaseError.customData,
    message: error instanceof Error ? error.message : String(error),
    name: firebaseError.name,
    serverResponse: firebaseError.serverResponse,
  };
};

export const getResources = async (): Promise<Resource[]> => {
  const resourcesRef = collection(db, RESOURCES_COLLECTION);
  const snapshot = await getDocs(resourcesRef);

  return snapshot.docs
    .map((resourceDoc) => {
      const data = resourceDoc.data();

      return {
        id: resourceDoc.id,
        fileName: data.fileName || "Recurso sin nombre",
        originalName: data.originalName || "",
        fileUrl: data.fileUrl || "",
        storagePath: data.storagePath || "",
        contentType: data.contentType || "application/octet-stream",
        size: data.size || 0,
        order: typeof data.order === "number" ? data.order : 0,
        adminOnly: data.adminOnly === true,
        createdAt: data.createdAt || null,
        createdBy: data.createdBy || "",
      };
    })
    .sort((resourceA, resourceB) => {
      const orderDifference =
        getSortableOrder(resourceA) - getSortableOrder(resourceB);

      if (orderDifference !== 0) {
        return orderDifference;
      }

      const createdA = resourceA.createdAt?.toMillis?.() || 0;
      const createdB = resourceB.createdAt?.toMillis?.() || 0;
      return createdB - createdA;
    });
};

export const uploadResource = async ({
  fileName,
  file,
  createdBy,
  adminOnly,
}: CreateResourceData): Promise<Resource> => {
  const safeOriginalName = sanitizeFileName(file.name) || "resource";
  const storagePath = `resources/${Date.now()}-${safeOriginalName}`;
  const storageRef = ref(storage, storagePath);
  const contentType = file.type || "application/octet-stream";
  const existingResources = await getResources();
  const nextOrder =
    existingResources
      .filter((resource) => resource.adminOnly === adminOnly)
      .reduce(
        (maxOrder, resource) => Math.max(maxOrder, resource.order || 0),
        0
      ) + 1;
  const debugContext = {
    adminOnly,
    bucket: storage.app.options.storageBucket,
    contentType,
    createdBy,
    fileName: fileName.trim(),
    originalName: file.name,
    size: file.size,
    storagePath,
  };

  console.info("[Resources] Starting resource upload", debugContext);

  try {
    await uploadBytes(storageRef, file, {
      contentType,
    });
    console.info("[Resources] Storage upload succeeded", debugContext);
  } catch (error) {
    console.error(
      "[Resources] Storage upload failed. Check Firebase Storage bucket/rules.",
      {
        ...debugContext,
        error: getErrorDetails(error),
      },
      error
    );
    throw error;
  }

  try {
    console.info("[Resources] Requesting download URL", debugContext);
    const fileUrl = await getDownloadURL(storageRef);
    console.info("[Resources] Download URL created", {
      ...debugContext,
      fileUrl,
    });

    console.info("[Resources] Saving resource document in Firestore", {
      ...debugContext,
      collection: RESOURCES_COLLECTION,
    });
    const docRef = await addDoc(collection(db, RESOURCES_COLLECTION), {
      fileName: fileName.trim(),
      originalName: file.name,
      fileUrl,
      storagePath,
      contentType,
      size: file.size,
      order: nextOrder,
      adminOnly,
      createdAt: serverTimestamp(),
      createdBy,
    });
    console.info("[Resources] Firestore resource document created", {
      ...debugContext,
      id: docRef.id,
    });

    return {
      id: docRef.id,
      fileName: fileName.trim(),
      originalName: file.name,
      fileUrl,
      storagePath,
      contentType,
      size: file.size,
      order: nextOrder,
      adminOnly,
      createdAt: null,
      createdBy,
    };
  } catch (error) {
    console.error(
      "[Resources] Firestore save or download URL failed. The uploaded file will be cleaned up.",
      {
        ...debugContext,
        collection: RESOURCES_COLLECTION,
        error: getErrorDetails(error),
      },
      error
    );
    await deleteObject(storageRef).catch((deleteError) => {
      console.error(
        "[Resources] Error deleting orphaned resource file:",
        {
          ...debugContext,
          error: getErrorDetails(deleteError),
        },
        deleteError
      );
    });
    throw error;
  }
};

export const deleteResource = async (resource: Resource): Promise<void> => {
  if (resource.storagePath) {
    await deleteObject(ref(storage, resource.storagePath)).catch((error) => {
      console.error("Error deleting resource file from storage:", error);
      throw error;
    });
  }

  await deleteDoc(doc(db, RESOURCES_COLLECTION, resource.id));
};

export const reorderResources = async (resources: Resource[]): Promise<void> => {
  const batch = writeBatch(db);

  resources.forEach((resource, index) => {
    batch.update(doc(db, RESOURCES_COLLECTION, resource.id), {
      order: index + 1,
    });
  });

  await batch.commit();
};
