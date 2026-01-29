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
} from 'firebase/firestore';
import { db } from '../firebase/config';
import { Minuta } from '../types/Minuta';
import { UserProfile, UserRole, UserBranch } from '../types/auth';
import { addEvent } from './eventService';
import { getAllUsers } from './userService';
import { sendMinutaNotification, logMinutaNotification } from './whatsappService';

const MINUTAS_COLLECTION = 'minutas';

// Convert Firestore timestamp to Date
const convertTimestampToDate = (timestamp: any): Date => {
  if (timestamp?.toDate) {
    return timestamp.toDate();
  }
  if (timestamp?.seconds) {
    return new Date(timestamp.seconds * 1000);
  }
  return new Date(timestamp);
};

// Convert Date to Firestore timestamp
const convertDateToTimestamp = (date: Date): Timestamp => {
  return Timestamp.fromDate(date);
};

// Create a new minuta and associated event
export const createMinuta = async (
  minutaData: Omit<Minuta, 'id' | 'createdAt' | 'eventId'>,
  createdBy: string
): Promise<string> => {
  try {
    // First, create the minuta
    const minuta = {
      ...minutaData,
      nextMeetingDate: convertDateToTimestamp(minutaData.nextMeetingDate),
      createdAt: convertDateToTimestamp(new Date()),
      createdBy,
    };

    const minutaRef = await addDoc(collection(db, MINUTAS_COLLECTION), minuta);

    // Create an event for the next meeting date
    const eventTitle = `Reunión de Seguimiento - ${minutaData.role} (${minutaData.branch})`;
    const eventDescription = `Reunión de seguimiento para el rol ${minutaData.role} en sucursal ${minutaData.branch}.\n\nSupervisor: ${minutaData.supervisor}\n\nExpectativas: ${minutaData.expectations}`;

    const eventId = await addEvent({
      title: eventTitle,
      description: eventDescription,
      date: minutaData.nextMeetingDate,
      color: 'bg-purple-100 text-purple-800',
      type: 'minuta',
      createdBy,
      createdAt: new Date(),
      targetRole: minutaData.role,
      targetBranch: minutaData.branch,
      minutaId: minutaRef.id,
    });

    // Update the minuta with the event ID
    await updateDoc(doc(db, MINUTAS_COLLECTION, minutaRef.id), {
      eventId,
    });

    // Get users to notify (admins + users with specific role and branch)
    const targetUsers = await getUsersToNotify(minutaData.role, minutaData.branch);
    
    console.log(`Minuta created for ${minutaData.role} at ${minutaData.branch}`);
    console.log(`Event created with ID: ${eventId}`);
    console.log(`Target users for notification:`, targetUsers.length);

    // Send WhatsApp notifications
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
      // Don't fail the minuta creation if WhatsApp fails
      
      // Log the notification details for debugging
      logMinutaNotification(
        minutaData.supervisor,
        minutaData.role,
        minutaData.branch,
        minutaData.nextMeetingDate,
        minutaData.expectations,
        targetUsers
      );
    }

    return minutaRef.id;
  } catch (error) {
    console.error('Error creating minuta:', error);
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
      const data = doc.data();
      minutas.push({
        id: doc.id,
        supervisor: data.supervisor,
        branch: data.branch,
        role: data.role,
        whatHappened: data.whatHappened,
        expectations: data.expectations,
        nextMeetingDate: convertTimestampToDate(data.nextMeetingDate),
        createdAt: convertTimestampToDate(data.createdAt),
        createdBy: data.createdBy,
        eventId: data.eventId,
      });
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
      const data = doc.data();
      minutas.push({
        id: doc.id,
        supervisor: data.supervisor,
        branch: data.branch,
        role: data.role,
        whatHappened: data.whatHappened,
        expectations: data.expectations,
        nextMeetingDate: convertTimestampToDate(data.nextMeetingDate),
        createdAt: convertTimestampToDate(data.createdAt),
        createdBy: data.createdBy,
        eventId: data.eventId,
      });
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