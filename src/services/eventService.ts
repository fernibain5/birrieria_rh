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
import { UserProfile } from '../types/auth';

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

    // Add targeting fields for minuta events
    if (event.targetRole) eventData.targetRole = event.targetRole;
    if (event.targetBranch) eventData.targetBranch = event.targetBranch;
    if (event.minutaId) eventData.minutaId = event.minutaId;
    
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

// Check if holidays exist for a specific year
export const checkHolidaysExistForYear = async (year: number): Promise<boolean> => {
  try {
    const eventsRef = collection(db, EVENTS_COLLECTION);
    const q = query(
      eventsRef,
      where('year', '==', year),
      where('type', '==', 'holiday')
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
  console.log('🔍 DEBUG: Filtering events for user:', {
    role: userProfile.role,
    branch: userProfile.branch,
    totalEvents: events.length
  });

  const filteredEvents = events.filter(event => {
    // Admins can see all events
    if (userProfile.role === 'admin') {
      console.log('🔍 DEBUG: Admin user - showing all events');
      return true;
    }

    // For minuta events, check if user matches the target role and branch
    if (event.type === 'minuta') {
      const shouldShow = (
        event.targetRole === userProfile.role && 
        event.targetBranch === userProfile.branch
      );
      console.log('🔍 DEBUG: Minuta event:', {
        eventTitle: event.title,
        targetRole: event.targetRole,
        targetBranch: event.targetBranch,
        userRole: userProfile.role,
        userBranch: userProfile.branch,
        shouldShow
      });
      return shouldShow;
    }

    // ADDITIONAL CHECK: For events that might be minuta events but saved with wrong type
    // Check if the title matches the minuta pattern: "Reunión de Seguimiento - {role} ({branch})"
    if (event.title?.startsWith('Reunión de Seguimiento -')) {
      console.log('🔍 DEBUG: Potential minuta event with wrong type detected:', event.title);
      
      // Extract role and branch from the title
      const titleMatch = event.title.match(/Reunión de Seguimiento - (\w+) \(([^)]+)\)/);
      if (titleMatch) {
        const [, titleRole, titleBranch] = titleMatch;
        const shouldShow = (
          titleRole === userProfile.role && 
          titleBranch === userProfile.branch
        );
        console.log('🔍 DEBUG: Extracted from title - role:', titleRole, 'branch:', titleBranch, 'shouldShow:', shouldShow);
        return shouldShow;
      }
    }

    // All other events (holiday, custom) are visible to all authenticated users
    console.log('🔍 DEBUG: Non-minuta event:', {
      eventTitle: event.title,
      eventType: event.type,
      showing: true
    });
    return true;
  });

  console.log('🔍 DEBUG: Filtered events result:', {
    original: events.length,
    filtered: filteredEvents.length,
    minutaEvents: filteredEvents.filter(e => e.type === 'minuta').length
  });

  return filteredEvents;
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