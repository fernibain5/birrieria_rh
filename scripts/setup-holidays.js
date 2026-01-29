// Script to populate Mexican holidays in Firestore
// Run this with: node scripts/setup-holidays.js [year]
// If no year is provided, it will add holidays for current and next year

import { initializeApp } from "firebase/app";
import {
  getFirestore,
  collection,
  addDoc,
  query,
  where,
  getDocs,
  Timestamp,
} from "firebase/firestore";

// Your Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyA9YJX9gyMLcRaxBPadLF_WD5C6j-uMSn0",
  authDomain: "birrieria-la-purisima.firebaseapp.com",
  projectId: "birrieria-la-purisima",
  storageBucket: "birrieria-la-purisima.firebasestorage.app",
  messagingSenderId: "249871542777",
  appId: "1:249871542777:web:2e4c65a21fef5ef1a03528",
  measurementId: "G-8KHGMH88DQ",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Helper function to get the nth occurrence of a weekday in a month
const getNthWeekdayOfMonth = (year, month, weekday, n) => {
  // weekday: 0 = Sunday, 1 = Monday, etc.
  // month: 0 = January, 1 = February, etc.
  const firstDay = new Date(year, month, 1);
  const firstWeekday = firstDay.getDay();

  // Calculate days to add to get to the first occurrence of the desired weekday
  let daysToAdd = (weekday - firstWeekday + 7) % 7;

  // Add weeks to get to the nth occurrence
  daysToAdd += (n - 1) * 7;

  return new Date(year, month, 1 + daysToAdd);
};

// Generate Mexican holidays for a specific year
const generateMexicanHolidays = (year) => {
  const holidays = [];

  // 1 de enero: Año Nuevo (fixed date)
  holidays.push({
    title: "Año Nuevo",
    description: "Celebración del inicio del nuevo año",
    date: Timestamp.fromDate(new Date(year, 0, 1)),
    color: "bg-red-100 text-red-800",
    type: "holiday",
    year: year,
    createdAt: Timestamp.fromDate(new Date()),
  });

  // 3 de febrero: Aniversario de la Constitución (first Monday of February)
  const constitutionDay = getNthWeekdayOfMonth(year, 1, 1, 1);
  holidays.push({
    title: "Aniversario de la Constitución",
    description:
      "Conmemoración de la Constitución Política de los Estados Unidos Mexicanos",
    date: Timestamp.fromDate(constitutionDay),
    color: "bg-blue-100 text-blue-800",
    type: "holiday",
    year: year,
    createdAt: Timestamp.fromDate(new Date()),
  });

  // 17 de marzo: Natalicio de Benito Juárez (third Monday of March)
  const benitorJuarezDay = getNthWeekdayOfMonth(year, 2, 1, 3);
  holidays.push({
    title: "Natalicio de Benito Juárez",
    description: "Conmemoración del nacimiento de Benito Juárez",
    date: Timestamp.fromDate(benitorJuarezDay),
    color: "bg-green-100 text-green-800",
    type: "holiday",
    year: year,
    createdAt: Timestamp.fromDate(new Date()),
  });

  // 1 de mayo: Día del Trabajo (fixed date)
  holidays.push({
    title: "Día del Trabajo",
    description: "Celebración del Día Internacional de los Trabajadores",
    date: Timestamp.fromDate(new Date(year, 4, 1)),
    color: "bg-yellow-100 text-yellow-800",
    type: "holiday",
    year: year,
    createdAt: Timestamp.fromDate(new Date()),
  });

  // 16 de septiembre: Día de la Independencia (fixed date)
  holidays.push({
    title: "Día de la Independencia",
    description: "Conmemoración de la Independencia de México",
    date: Timestamp.fromDate(new Date(year, 8, 16)),
    color: "bg-green-100 text-green-800",
    type: "holiday",
    year: year,
    createdAt: Timestamp.fromDate(new Date()),
  });

  // 17 de noviembre: Aniversario de la Revolución (third Monday of November)
  const revolutionDay = getNthWeekdayOfMonth(year, 10, 1, 3);
  holidays.push({
    title: "Aniversario de la Revolución",
    description: "Conmemoración del inicio de la Revolución Mexicana",
    date: Timestamp.fromDate(revolutionDay),
    color: "bg-purple-100 text-purple-800",
    type: "holiday",
    year: year,
    createdAt: Timestamp.fromDate(new Date()),
  });

  // 25 de diciembre: Navidad (fixed date)
  holidays.push({
    title: "Navidad",
    description: "Celebración del nacimiento de Jesucristo",
    date: Timestamp.fromDate(new Date(year, 11, 25)),
    color: "bg-red-100 text-red-800",
    type: "holiday",
    year: year,
    createdAt: Timestamp.fromDate(new Date()),
  });

  return holidays;
};

// Check if holidays already exist for a year
const checkHolidaysExist = async (year) => {
  try {
    const eventsRef = collection(db, "events");
    const q = query(
      eventsRef,
      where("year", "==", year),
      where("type", "==", "holiday")
    );
    const querySnapshot = await getDocs(q);
    return !querySnapshot.empty;
  } catch (error) {
    console.error("Error checking existing holidays:", error);
    return false;
  }
};

// Add holidays to Firestore
const addHolidaysToFirestore = async (year) => {
  try {
    console.log(`🎄 Checking holidays for year ${year}...`);

    const holidaysExist = await checkHolidaysExist(year);
    if (holidaysExist) {
      console.log(`⚠️  Holidays for ${year} already exist. Skipping...`);
      return;
    }

    const holidays = generateMexicanHolidays(year);
    console.log(`📅 Adding ${holidays.length} holidays for year ${year}...`);

    for (const holiday of holidays) {
      await addDoc(collection(db, "events"), holiday);
      console.log(
        `✅ Added: ${holiday.title} - ${holiday.date
          .toDate()
          .toLocaleDateString("es-MX")}`
      );
    }

    console.log(`🎉 Successfully added all holidays for ${year}!`);
  } catch (error) {
    console.error(`❌ Error adding holidays for ${year}:`, error);
  }
};

// Main function
const main = async () => {
  try {
    const args = process.argv.slice(2);
    let yearsToAdd = [];

    if (args.length === 0) {
      // No year provided, add current and next year
      const currentYear = new Date().getFullYear();
      yearsToAdd = [currentYear, currentYear + 1];
      console.log(
        `📅 No year specified. Adding holidays for ${currentYear} and ${
          currentYear + 1
        }...`
      );
    } else {
      // Parse provided years
      for (const arg of args) {
        const year = parseInt(arg);
        if (isNaN(year) || year < 1900 || year > 2100) {
          console.error(
            `❌ Invalid year: ${arg}. Please provide a valid year between 1900 and 2100.`
          );
          process.exit(1);
        }
        yearsToAdd.push(year);
      }
      console.log(
        `📅 Adding holidays for year(s): ${yearsToAdd.join(", ")}...`
      );
    }

    // Add holidays for each year
    for (const year of yearsToAdd) {
      await addHolidaysToFirestore(year);
    }

    console.log(
      "\n🎄 Holiday setup completed! You can now use the calendar to view these holidays."
    );
    console.log(
      "💡 To add holidays for other years, run: node scripts/setup-holidays.js [year]"
    );
  } catch (error) {
    console.error("❌ Fatal error:", error);
  }

  process.exit(0);
};

// Run the script
main();
