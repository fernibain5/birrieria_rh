import type { FormStep } from '../types/contract';

export const actaAdministrativaFormSteps: FormStep[] = [
  {
    title: 'Información General',
    description: 'Datos básicos del acta administrativa',
    fields: [
      {
        name: 'employeeName',
        label: 'Nombre completo del trabajador',
        type: 'text',
        required: true,
        placeholder: 'Ej: Juan Pérez García'
      },
      {
        name: 'position',
        label: 'Puesto de trabajo',
        type: 'text',
        required: true,
        placeholder: 'Ej: Mesero, Cocinero, Cajero'
      },
      {
        name: 'actaDate',
        label: 'Fecha del incidente',
        type: 'date',
        required: true
      },
      {
        name: 'actaTime',
        label: 'Hora del incidente',
        type: 'time',
        required: true
      }
    ]
  },
  {
    title: 'Descripción del Incidente',
    description: 'Detalles de los hechos ocurridos',
    fields: [
      {
        name: 'actaIncidentDescription',
        label: 'Descripción detallada del incidente',
        type: 'textarea',
        required: true,
        placeholder: 'Describa los hechos de manera detallada y objetiva...'
      }
    ]
  },
  {
    title: 'Primer Testigo',
    description: 'Información del primer testigo de cargo',
    fields: [
      {
        name: 'actaWitness1Name',
        label: 'Nombre completo del primer testigo',
        type: 'text',
        required: true,
        placeholder: 'Ej: María López Hernández'
      },
      {
        name: 'actaWitness1Address',
        label: 'Domicilio del primer testigo',
        type: 'text',
        required: true,
        placeholder: 'Ej: Calle Principal #123, Col. Centro'
      },
      {
        name: 'actaWitness1Id',
        label: 'Número de credencial del primer testigo',
        type: 'text',
        required: true,
        placeholder: 'Ej: 1234567890'
      },
      {
        name: 'actaWitness1Statement',
        label: 'Declaración del primer testigo',
        type: 'textarea',
        required: true,
        placeholder: 'Describa lo que presenció el testigo...'
      }
    ]
  },
  {
    title: 'Segundo Testigo',
    description: 'Información del segundo testigo de cargo',
    fields: [
      {
        name: 'actaWitness2Name',
        label: 'Nombre completo del segundo testigo',
        type: 'text',
        required: true,
        placeholder: 'Ej: Carlos Rodríguez Morales'
      },
      {
        name: 'actaWitness2Address',
        label: 'Domicilio del segundo testigo',
        type: 'text',
        required: true,
        placeholder: 'Ej: Av. Reforma #456, Col. Moderna'
      },
      {
        name: 'actaWitness2Id',
        label: 'Número de credencial del segundo testigo',
        type: 'text',
        required: true,
        placeholder: 'Ej: 0987654321'
      },
      {
        name: 'actaWitness2Statement',
        label: 'Declaración del segundo testigo',
        type: 'textarea',
        required: true,
        placeholder: 'Describa lo que presenció el testigo...'
      }
    ]
  }
];
