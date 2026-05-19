import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  getDocs,
  query,
  where,
  orderBy,
  Timestamp,
} from 'firebase/firestore';
import { db } from '../firebase/config';
import { Event } from '../types/Event';
import { UserBranch, UserProfile } from '../types/auth';

const EVENTS_COLLECTION = 'events';

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

// Get all events from Firestore
export const getAllEvents = async (): Promise<Event[]> => {
  try {
    const eventsRef = collection(db, EVENTS_COLLECTION);
    const q = query(eventsRef, orderBy('date', 'asc'));
    const querySnapshot = await getDocs(q);
    
    const events: Event[] = [];
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      events.push({
        id: doc.id,
        title: data.title,
        description: data.description,
        date: convertTimestampToDate(data.date),
        color: data.color,
        type: data.type || 'custom',
        year: data.year,
        createdAt: data.createdAt ? convertTimestampToDate(data.createdAt) : undefined,
        createdBy: data.createdBy,
        targetRole: data.targetRole,
        targetBranch: data.targetBranch,
        minutaId: data.minutaId,
      });
    });
    
    return events;
  } catch (error) {
    console.error('Error getting events:', error);
    throw error;
  }
};

// Get events for a specific year
export const getEventsByYear = async (year: number): Promise<Event[]> => {
  try {
    const eventsRef = collection(db, EVENTS_COLLECTION);
    const q = query(
      eventsRef,
      where('year', '==', year),
      orderBy('date', 'asc')
    );
    const querySnapshot = await getDocs(q);
    
    const events: Event[] = [];
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      events.push({
        id: doc.id,
        title: data.title,
        description: data.description,
        date: convertTimestampToDate(data.date),
        color: data.color,
        type: data.type || 'custom',
        year: data.year,
        createdAt: data.createdAt ? convertTimestampToDate(data.createdAt) : undefined,
        createdBy: data.createdBy,
        targetRole: data.targetRole,
        targetBranch: data.targetBranch,
        minutaId: data.minutaId,
      });
    });
    
    return events;
  } catch (error) {
    console.error('Error getting events by year:', error);
    throw error;
  }
};

// Add a new event
export const addEvent = async (event: Omit<Event, 'id'>): Promise<string> => {
  try {
    const eventData: any = {
      title: event.title,
      description: event.description || '',
      date: convertDateToTimestamp(event.date),
      color: event.color || 'bg-blue-100 text-blue-800',
      type: event.type || 'custom',
      year: event.year || event.date.getFullYear(),
      createdAt: convertDateToTimestamp(event.createdAt || new Date()),
      createdBy: event.createdBy || '',
    };

    if (event.targetRole)   eventData.targetRole   = event.targetRole;
    if (event.targetBranch) eventData.targetBranch = event.targetBranch;
    if (event.minutaId)     eventData.minutaId     = event.minutaId;
    
    const docRef = await addDoc(collection(db, EVENTS_COLLECTION), eventData);
    return docRef.id;
  } catch (error) {
    console.error('Error adding event:', error);
    throw error;
  }
};

// Update an existing event
export const updateEvent = async (id: string, event: Partial<Event>): Promise<void> => {
  try {
    const eventRef = doc(db, EVENTS_COLLECTION, id);
    const updateData: any = {};
    
    if (event.title !== undefined) updateData.title = event.title;
    if (event.description !== undefined) updateData.description = event.description;
    if (event.date !== undefined) {
      updateData.date = convertDateToTimestamp(event.date);
      updateData.year = event.date.getFullYear();
    }
    if (event.color !== undefined) updateData.color = event.color;
    if (event.type !== undefined) updateData.type = event.type;
    
    await updateDoc(eventRef, updateData);
  } catch (error) {
    console.error('Error updating event:', error);
    throw error;
  }
};

// Delete an event
export const deleteEvent = async (id: string): Promise<void> => {
  try {
    await deleteDoc(doc(db, EVENTS_COLLECTION, id));
  } catch (error) {
    console.error('Error deleting event:', error);
    throw error;
  }
};

// Check if holidays exist for a specific year and branch
export const checkHolidaysExistForYear = async (year: number, branch: UserBranch): Promise<boolean> => {
  try {
    const eventsRef = collection(db, EVENTS_COLLECTION);
    const q = query(
      eventsRef,
      where('year', '==', year),
      where('type', '==', 'holiday'),
      where('targetBranch', '==', branch)
    );
    const querySnapshot = await getDocs(q);
    return !querySnapshot.empty;
  } catch (error) {
    console.error('Error checking holidays for year:', error);
    return false;
  }
};

// Batch add multiple events (useful for adding all holidays at once)
export const addMultipleEvents = async (events: Omit<Event, 'id'>[]): Promise<void> => {
  try {
    const promises = events.map(event => addEvent(event));
    await Promise.all(promises);
  } catch (error) {
    console.error('Error adding multiple events:', error);
    throw error;
  }
};

// Filter events based on user permissions
export const filterEventsForUser = (events: Event[], userProfile: UserProfile): Event[] => {
  // Admins see all events; branch filtering is done in the UI
  if (userProfile.role === 'admin') return events;

  return events.filter(event => {
    // Minuta events are role- and branch-specific
    if (event.type === 'minuta') {
      return event.targetRole === userProfile.role && event.targetBranch === userProfile.branch;
    }
    // All other events: show if they match the user's branch or have no branch set
    return !event.targetBranch || event.targetBranch === userProfile.branch;
  });
};

// Get filtered events for a specific user
export const getEventsForUser = async (userProfile: UserProfile): Promise<Event[]> => {
  try {
    const allEvents = await getAllEvents();
    return filterEventsForUser(allEvents, userProfile);
  } catch (error) {
    console.error('Error getting events for user:', error);
    throw error;
  }
};

// Get filtered events for a specific user and year
export const getEventsByYearForUser = async (year: number, userProfile: UserProfile): Promise<Event[]> => {
  try {
    const allEvents = await getEventsByYear(year);
    return filterEventsForUser(allEvents, userProfile);
  } catch (error) {
    console.error('Error getting events by year for user:', error);
    throw error;
  }
}; 