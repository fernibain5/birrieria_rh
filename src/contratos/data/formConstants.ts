export const MONTHS = [
  { value: 'ENERO', label: 'Enero' },
  { value: 'FEBRERO', label: 'Febrero' },
  { value: 'MARZO', label: 'Marzo' },
  { value: 'ABRIL', label: 'Abril' },
  { value: 'MAYO', label: 'Mayo' },
  { value: 'JUNIO', label: 'Junio' },
  { value: 'JULIO', label: 'Julio' },
  { value: 'AGOSTO', label: 'Agosto' },
  { value: 'SEPTIEMBRE', label: 'Septiembre' },
  { value: 'OCTUBRE', label: 'Octubre' },
  { value: 'NOVIEMBRE', label: 'Noviembre' },
  { value: 'DICIEMBRE', label: 'Diciembre' }
];

export const DAYS = Array.from({ length: 31 }, (_, i) => ({
  value: (i + 1).toString(),
  label: (i + 1).toString()
}));

export const YEARS = Array.from({ length: 5 }, (_, i) => {
  const year = new Date().getFullYear() + i;
  return {
    value: year.toString(),
    label: year.toString()
  };
});

export const WORKING_DAYS = [
  { value: 'LUNES', label: 'Lunes' },
  { value: 'MARTES', label: 'Martes' },
  { value: 'MIERCOLES', label: 'Miércoles' },
  { value: 'JUEVES', label: 'Jueves' },
  { value: 'VIERNES', label: 'Viernes' },
  { value: 'SABADO', label: 'Sábado' },
  { value: 'DOMINGO', label: 'Domingo' }
];

export const REST_DAYS = [
  { value: 'LUNES', label: 'Lunes' },
  { value: 'MARTES', label: 'Martes' },
  { value: 'MIERCOLES', label: 'Miércoles' },
  { value: 'JUEVES', label: 'Jueves' },
  { value: 'VIERNES', label: 'Viernes' },
  { value: 'SABADO', label: 'Sábado' },
  { value: 'DOMINGO', label: 'Domingo' }
];

export const PAYMENT_DAYS = [
  { value: 'VIERNES', label: 'Viernes' },
  { value: 'SABADO', label: 'Sábado' },
  { value: 'DOMINGO', label: 'Domingo' },
  { value: 'LUNES', label: 'Lunes' },
  { value: 'MARTES', label: 'Martes' },
  { value: 'MIERCOLES', label: 'Miércoles' },
  { value: 'JUEVES', label: 'Jueves' },
  { value: 'QUINCENAL', label: 'Quincenal' },
  { value: 'MENSUAL', label: 'Mensual' }
];

export const PAYMENT_METHODS = [
  { value: 'TRANSFERENCIA', label: 'Transferencia Bancaria' },
  { value: 'EFECTIVO', label: 'Efectivo' }
];

export const BANKS = [
  { value: 'BANAMEX', label: 'Banamex' },
  { value: 'BANORTE', label: 'Banorte' },
  { value: 'BBVA', label: 'BBVA' },
  { value: 'SANTANDER', label: 'Santander' },
  { value: 'HSBC', label: 'HSBC' },
  { value: 'SCOTIABANK', label: 'Scotiabank' },
  { value: 'BANCO AZTECA', label: 'Banco Azteca' },
  { value: 'BANCO DEL BAJIO', label: 'Banco del Bajío' },
  { value: 'BANCOPPEL', label: 'Bancoppel' },
  { value: 'INBURSA', label: 'Inbursa' }
];

export const CIVIL_STATUS = [
  { value: 'SOLTERO', label: 'Soltero(a)' },
  { value: 'CASADO', label: 'Casado(a)' },
  { value: 'DIVORCIADO', label: 'Divorciado(a)' },
  { value: 'VIUDO', label: 'Viudo(a)' },
  { value: 'UNION LIBRE', label: 'Unión Libre' }
];

// Owner information
export interface OwnerInfo {
  name: string;
  gender: 'FEMENINO' | 'MASCULINO';
  genderArticle: 'la' | 'el';
  ownershipWord: 'dueña' | 'dueño';
  ownershipWord2: 'propietaria' | 'propietario';
}

export interface BranchInfo {
  name: string;
  address: string;
}

export const OWNERS: Record<string, OwnerInfo> = {
  'olivia': {
    name: 'OLIVIA GONZALEZ MERCADO',
    gender: 'FEMENINO',
    genderArticle: 'la',
    ownershipWord: 'dueña',
    ownershipWord2: 'propietaria'
  },
  'jesus': {
    name: 'JESUS ENRIQUE CAMPOS GONZALEZ',
    gender: 'MASCULINO',
    genderArticle: 'el',
    ownershipWord: 'dueño',
    ownershipWord2: 'propietario'
  }
};

export const BRANCHES: Record<string, BranchInfo> = {
  'main': {
    name: 'BIRRIERIA LA PURISIMA',
    address: 'CARR. A URES KM 1 COLONIA SAN PEDRO EL SAUCITO DE ESTA CIUDAD'
  },
  'lasquintas': {
    name: 'BIRRIERIA LA PURISIMA LAS QUINTAS',
    address: 'BLVD. PASEO DE LAS QUINTAS NUMERO 85 COLONIA MONTEBELLO DE ESTA CIUDAD'
  }
};

export const OWNER_OPTIONS = [
  { value: 'olivia', label: 'Olivia Gonzalez Mercado' },
  { value: 'jesus', label: 'Jesus Enrique Campos Gonzalez' }
];

export const BRANCH_OPTIONS = [
  { value: 'main', label: 'BIRRIERIA LA PURISIMA' },
  { value: 'lasquintas', label: 'BIRRIERIA LA PURISIMA SUC. LAS QUINTAS' }
]; 