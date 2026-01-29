import { UserProfile } from '../types/auth';

// WhatsApp Web API endpoint (you can replace this with Twilio or another service)
const WHATSAPP_API_URL = 'https://api.whatsapp.com/send';

// Format phone number for WhatsApp (Mexican numbers)
const formatPhoneNumber = (phoneNumber: string): string => {
  // Remove any non-numeric characters
  const cleanNumber = phoneNumber.replace(/\D/g, '');
  
  // If it's already 10 digits (Mexican mobile), add country code
  if (cleanNumber.length === 10) {
    return `52${cleanNumber}`;
  }
  
  // If it already has country code, return as is
  if (cleanNumber.length === 12 && cleanNumber.startsWith('52')) {
    return cleanNumber;
  }
  
  // Default: assume it's a Mexican number and add country code
  return `52${cleanNumber}`;
};

// Create WhatsApp message content for minuta notification
const createMinutaMessage = (
  supervisorName: string,
  role: string,
  branch: string,
  nextMeetingDate: Date,
  expectations: string
): string => {
  const formattedDate = nextMeetingDate.toLocaleDateString('es-ES', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  return `🍲 *Birriería La Purísima - Nueva Reunión de Seguimiento*

Hola! Se ha programado una nueva reunión de seguimiento.

📋 *Detalles:*
• *Supervisor:* ${supervisorName}
• *Puesto:* ${role}
• *Sucursal:* ${branch}
• *Fecha:* ${formattedDate}

📝 *Lo que se espera de ti:*
${expectations}

Por favor, asegúrate de estar disponible en la fecha programada.

¡Gracias por tu compromiso!

_Este es un mensaje automático del sistema de gestión._`;
};

// Send WhatsApp message using WhatsApp Web API (opens in browser)
export const sendWhatsAppMessage = (phoneNumber: string, message: string): void => {
  const formattedNumber = formatPhoneNumber(phoneNumber);
  const encodedMessage = encodeURIComponent(message);
  const whatsappUrl = `${WHATSAPP_API_URL}?phone=${formattedNumber}&text=${encodedMessage}`;
  
  console.log(`🔗 WhatsApp URL: ${whatsappUrl}`);
  
  // Try to open WhatsApp in a new tab
  const newWindow = window.open(whatsappUrl, '_blank');
  
  // Check if popup was blocked
  if (!newWindow || newWindow.closed || typeof newWindow.closed === 'undefined') {
    console.error('❌ Popup blocked! WhatsApp tab could not be opened.');
    alert(`❌ Popup bloqueado!\n\nPara enviar WhatsApp a +52${phoneNumber}:\n1. Permite popups en este sitio\n2. O copia este enlace:\n${whatsappUrl}`);
  } else {
    console.log(`✅ WhatsApp tab opened successfully for +52${phoneNumber}`);
  }
};

// Send messages to multiple users (opens multiple tabs)
export const sendWhatsAppMessages = (
  recipients: { phoneNumber: string; name: string }[],
  message: string
): void => {
  console.log(`📱 Attempting to send ${recipients.length} WhatsApp messages...`);
  
  recipients.forEach((recipient, index) => {
    if (recipient.phoneNumber) {
      // Add a small delay between opening tabs to avoid browser blocking
      setTimeout(() => {
        console.log(`📱 [${index + 1}/${recipients.length}] Sending WhatsApp message to ${recipient.name} (+52${recipient.phoneNumber})`);
        sendWhatsAppMessage(recipient.phoneNumber, message);
      }, index * 1500); // Increased delay to 1.5 seconds between each message
    }
  });
  
  // Show instructions to user
  setTimeout(() => {
    alert(`📱 Instrucciones:\n\n✅ Se intentaron abrir ${recipients.length} pestañas de WhatsApp\n\n⚠️ Si no se abrieron:\n• Permite popups en tu navegador\n• Revisa la consola del navegador (F12)\n• Verifica que WhatsApp Web esté configurado`);
  }, recipients.length * 1500 + 1000);
};

// Fallback: Show WhatsApp URLs directly if popups are blocked
export const showWhatsAppUrls = (
  recipients: { phoneNumber: string; name: string }[],
  message: string
): void => {
  const urls = recipients.map(recipient => {
    const formattedNumber = formatPhoneNumber(recipient.phoneNumber);
    const encodedMessage = encodeURIComponent(message);
    return {
      name: recipient.name,
      phone: `+52${recipient.phoneNumber}`,
      url: `${WHATSAPP_API_URL}?phone=${formattedNumber}&text=${encodedMessage}`
    };
  });

  console.log('📱 WhatsApp URLs for manual sending:');
  urls.forEach(item => {
    console.log(`👤 ${item.name} (${item.phone}): ${item.url}`);
  });

  // Create a modal-like alert with the URLs
  const urlList = urls.map(item => `👤 ${item.name} (${item.phone})\n🔗 ${item.url}`).join('\n\n');
  
  alert(`📱 Enlaces de WhatsApp\n\nCopia y pega estos enlaces en tu navegador:\n\n${urlList}`);
};

// Send minuta notification to target users
export const sendMinutaNotification = async (
  supervisorName: string,
  role: string,
  branch: string,
  nextMeetingDate: Date,
  expectations: string,
  targetUsers: UserProfile[]
): Promise<void> => {
  try {
    const message = createMinutaMessage(supervisorName, role, branch, nextMeetingDate, expectations);
    
    // Filter users with phone numbers
    const recipients = targetUsers
      .filter(user => user.phoneNumber)
      .map(user => ({
        phoneNumber: user.phoneNumber!,
        name: user.displayName || user.email
      }));

    if (recipients.length === 0) {
      console.warn('⚠️ No users with phone numbers found for notification');
      return;
    }

    console.log(`📱 Sending WhatsApp notifications to ${recipients.length} users`);
    
    // Show confirmation dialog with options
    const userChoice = window.confirm(
      `📱 ¿Cómo quieres enviar las notificaciones de WhatsApp?\n\n` +
      `Destinatarios (${recipients.length}):\n${recipients.map(r => `• ${r.name} (+52${r.phoneNumber})`).join('\n')}\n\n` +
      `✅ OK = Abrir pestañas automáticamente\n❌ Cancelar = Mostrar enlaces para copiar manualmente`
    );

    if (userChoice) {
      // User chose automatic tabs
      sendWhatsAppMessages(recipients, message);
    } else {
      // User chose manual URLs
      showWhatsAppUrls(recipients, message);
    }
  } catch (error) {
    console.error('Error sending WhatsApp notifications:', error);
    throw error;
  }
};

// Alternative: Console log for development/testing
export const logMinutaNotification = (
  supervisorName: string,
  role: string,
  branch: string,
  nextMeetingDate: Date,
  expectations: string,
  targetUsers: UserProfile[]
): void => {
  const message = createMinutaMessage(supervisorName, role, branch, nextMeetingDate, expectations);
  
  console.log('📱 WhatsApp Notification Details:');
  console.log('Message:', message);
  console.log('Target Users:', targetUsers.map(user => ({
    name: user.displayName || user.email,
    phone: user.phoneNumber ? `+52${user.phoneNumber}` : 'No phone',
    role: user.role,
    branch: user.branch
  })));
};

// Test function - you can call this from the browser console
export const testWhatsAppMessage = (): void => {
  const testMessage = `🍲 *Birriería La Purísima - Mensaje de Prueba*

Hola! Este es un mensaje de prueba del sistema de notificaciones.

Si recibes este mensaje, significa que el sistema está funcionando correctamente.

_Mensaje enviado desde el sistema de gestión._`;

  console.log('🧪 Testing WhatsApp message...');
  
  // Test with your phone number
  const testPhone = '6623581262';
  console.log(`📱 Sending test message to +52${testPhone}`);
  
  sendWhatsAppMessage(testPhone, testMessage);
}; 