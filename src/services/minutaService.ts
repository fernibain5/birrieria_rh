import {
  collection,
  addDoc,
  getDocs,
  query,
  orderBy,
  Timestamp,
  where,
  updateDoc,
  doc,
  getDoc,
  DocumentData,
} from 'firebase/firestore';
import { db } from '../firebase/config';
import { Minuta, MinutaArea, MinutaStatus } from '../types/Minuta';
import { UserProfile, UserRole, UserBranch } from '../types/auth';
import { addEvent, deleteEvent } from './eventService';
import { getAllUsers } from './userService';
import { sendMinutaNotification, logMinutaNotification } from './whatsappService';

const MINUTAS_COLLECTION = 'minutas';
type CreateMinutaData = Omit<Minuta, 'id' | 'createdAt' | 'eventId'>;
const PENDING_STATUS: MinutaStatus = 'pending';
const COMPLETED_STATUS: MinutaStatus = 'completed';

// Convert Firestore timestamp to Date
const convertTimestampToDate = (timestamp: unknown): Date => {
  if (timestamp instanceof Date) {
    return timestamp;
  }

  if (timestamp && typeof timestamp === 'object') {
    const firestoreTimestamp = timestamp as { toDate?: () => Date; seconds?: number };

    if (firestoreTimestamp.toDate) {
      return firestoreTimestamp.toDate();
    }

    if (firestoreTimestamp.seconds) {
      return new Date(firestoreTimestamp.seconds * 1000);
    }
  }

  if (typeof timestamp === 'string' || typeof timestamp === 'number') {
    return new Date(timestamp);
  }

  return new Date();
};

// Convert Date to Firestore timestamp
const convertDateToTimestamp = (date: Date): Timestamp => {
  return Timestamp.fromDate(date);
};

const removeUndefinedValues = <T>(value: T): T => {
  if (Array.isArray(value)) {
    return value.map(removeUndefinedValues) as T;
  }

  if (value && typeof value === 'object' && !(value instanceof Date) && !(value instanceof Timestamp)) {
    return Object.fromEntries(
      Object.entries(value)
        .filter(([, entryValue]) => entryValue !== undefined)
        .map(([key, entryValue]) => [key, removeUndefinedValues(entryValue)])
    ) as T;
  }

  return value;
};

const normalizeStatus = (status?: string): MinutaStatus =>
  status === COMPLETED_STATUS ? COMPLETED_STATUS : PENDING_STATUS;

const normalizeAreas = (areas?: MinutaArea[]): MinutaArea[] =>
  (areas || []).map(area => ({
    ...area,
    status: normalizeStatus(area.status),
  }));

const getAreaResponsibleUids = (area: MinutaArea): string[] => {
  const uids = area.encargadoUids || (area.encargadoUid ? [area.encargadoUid] : []);
  return Array.from(new Set(uids.filter(Boolean)));
};

const getResponsibleUids = (areas?: MinutaArea[]): string[] =>
  Array.from(new Set((areas || []).flatMap(getAreaResponsibleUids)));

const getMinutaStatus = (areas: MinutaArea[], status?: string): MinutaStatus => {
  if (areas.length === 0) {
    return normalizeStatus(status);
  }

  return areas.every(area => normalizeStatus(area.status) === COMPLETED_STATUS)
    ? COMPLETED_STATUS
    : PENDING_STATUS;
};

const mapMinutaDoc = (docId: string, data: DocumentData): Minuta => ({
  ...(() => {
    const areas = normalizeAreas(data.areas);

    return {
      id: docId,
      supervisor: data.supervisor,
      branch: data.branch,
      role: data.role,
      whatHappened: data.whatHappened,
      expectations: data.expectations,
      nextMeetingDate: data.nextMeetingDate ? convertTimestampToDate(data.nextMeetingDate) : undefined,
      createdAt: convertTimestampToDate(data.createdAt),
      createdBy: data.createdBy,
      eventId: data.eventId,
      areaEventIds: data.areaEventIds || [],
      status: getMinutaStatus(areas, data.status),
      responsibleUids: data.responsibleUids || getResponsibleUids(areas),
      generalInfo: data.generalInfo,
      areas,
      attendees: data.attendees || [],
    };
  })(),
});

// Create a new minuta and associated event
export const createMinuta = async (
  minutaData: CreateMinutaData,
  createdBy: string
): Promise<string> => {
  try {
    const areas = normalizeAreas(minutaData.areas).map(area => ({
      ...area,
      status: PENDING_STATUS,
    }));

    // First, create the minuta
    const minuta = removeUndefinedValues({
      ...minutaData,
      areas,
      status: PENDING_STATUS,
      responsibleUids: minutaData.responsibleUids || getResponsibleUids(areas),
      nextMeetingDate: minutaData.nextMeetingDate
        ? convertDateToTimestamp(minutaData.nextMeetingDate)
        : undefined,
      createdAt: convertDateToTimestamp(new Date()),
      createdBy,
    });

    const minutaRef = await addDoc(collection(db, MINUTAS_COLLECTION), minuta);

    // Create one calendar event per area
    if (minutaData.branch && areas.length > 0) {
      const areaEventIds: string[] = [];

      for (const area of areas) {
        const eventDate = area.fechaCompromiso
          ? new Date(area.fechaCompromiso)
          : (minutaData.nextMeetingDate ?? new Date());

        const eventId = await addEvent({
          title: area.area,
          description: `Seguimiento del problema\nResponsable: ${area.encargadoName || 'Sin responsable'}`,
          date: eventDate,
          color: 'bg-purple-100 text-purple-800',
          type: 'minuta',
          createdBy,
          createdAt: new Date(),
          targetRole: minutaData.role,
          targetBranch: minutaData.branch,
          minutaId: minutaRef.id,
        });

        areaEventIds.push(eventId);
      }

      await updateDoc(doc(db, MINUTAS_COLLECTION, minutaRef.id), { areaEventIds });
    }

    // Send WhatsApp notifications if all required fields are present
    if (
      minutaData.nextMeetingDate &&
      minutaData.role &&
      minutaData.branch &&
      minutaData.supervisor &&
      minutaData.expectations
    ) {
      const targetUsers = await getUsersToNotify(minutaData.role, minutaData.branch);

      try {
        await sendMinutaNotification(
          minutaData.supervisor,
          minutaData.role,
          minutaData.branch,
          minutaData.nextMeetingDate,
          minutaData.expectations,
          targetUsers
        );
      } catch (whatsappError) {
        console.error('Error sending WhatsApp notifications:', whatsappError);
        logMinutaNotification(
          minutaData.supervisor,
          minutaData.role,
          minutaData.branch,
          minutaData.nextMeetingDate,
          minutaData.expectations,
          targetUsers
        );
      }
    }

    return minutaRef.id;
  } catch (error) {
    console.error('Error creating minuta:', error);
    throw error;
  }
};

export const completeMinutaArea = async (
  minutaId: string,
  areaIndex: number,
  userProfile: UserProfile
): Promise<Minuta> => {
  try {
    const minutaRef = doc(db, MINUTAS_COLLECTION, minutaId);
    const minutaSnapshot = await getDoc(minutaRef);

    if (!minutaSnapshot.exists()) {
      throw new Error('Minuta not found');
    }

    const minuta = mapMinutaDoc(minutaSnapshot.id, minutaSnapshot.data());
    const areas = minuta.areas || [];
    const area = areas[areaIndex];

    if (!area) {
      throw new Error('Partida not found');
    }

    const canComplete =
      userProfile.role === 'admin' ||
      getAreaResponsibleUids(area).includes(userProfile.uid);

    if (!canComplete) {
      throw new Error('User is not allowed to complete this partida');
    }

    if (area.status === COMPLETED_STATUS) {
      return minuta;
    }

    const updatedAreas = areas.map((currentArea, index) =>
      index === areaIndex
        ? { ...currentArea, status: COMPLETED_STATUS }
        : currentArea
    );
    const status = getMinutaStatus(updatedAreas);

    await updateDoc(minutaRef, {
      areas: removeUndefinedValues(updatedAreas),
      status,
      responsibleUids: getResponsibleUids(updatedAreas),
    });

    // When the minuta is fully completed, remove all its area calendar events
    if (status === COMPLETED_STATUS) {
      const eventIds = minuta.areaEventIds || [];
      await Promise.all(eventIds.map(id => deleteEvent(id).catch(() => {})));
    }

    return {
      ...minuta,
      areas: updatedAreas,
      status,
      responsibleUids: getResponsibleUids(updatedAreas),
    };
  } catch (error) {
    console.error('Error completing minuta partida:', error);
    throw error;
  }
};

// Get all minutas
export const getAllMinutas = async (): Promise<Minuta[]> => {
  try {
    const minutasRef = collection(db, MINUTAS_COLLECTION);
    const q = query(minutasRef, orderBy('createdAt', 'desc'));
    const querySnapshot = await getDocs(q);
    
    const minutas: Minuta[] = [];
    querySnapshot.forEach((doc) => {
      minutas.push(mapMinutaDoc(doc.id, doc.data()));
    });
    
    return minutas;
  } catch (error) {
    console.error('Error getting minutas:', error);
    throw error;
  }
};

// Get minutas by role and branch (for filtering)
export const getMinutasByRoleAndBranch = async (
  role: UserRole,
  branch: UserBranch
): Promise<Minuta[]> => {
  try {
    const minutasRef = collection(db, MINUTAS_COLLECTION);
    const q = query(
      minutasRef,
      where('role', '==', role),
      where('branch', '==', branch),
      orderBy('createdAt', 'desc')
    );
    const querySnapshot = await getDocs(q);
    
    const minutas: Minuta[] = [];
    querySnapshot.forEach((doc) => {
      minutas.push(mapMinutaDoc(doc.id, doc.data()));
    });
    
    return minutas;
  } catch (error) {
    console.error('Error getting minutas by role and branch:', error);
    throw error;
  }
};

// Get users that should be notified (admins + users with specific role and branch)
export const getUsersToNotify = async (
  role: UserRole,
  branch: UserBranch
): Promise<UserProfile[]> => {
  try {
    const allUsers = await getAllUsers();
    return allUsers.filter(user => 
      user.role === 'admin' || 
      (user.role === role && user.branch === branch)
    );
  } catch (error) {
    console.error('Error getting users to notify:', error);
    throw error;
  }
}; 
