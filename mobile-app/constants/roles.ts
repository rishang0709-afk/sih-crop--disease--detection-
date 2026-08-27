/**
 * constants/roles.ts — User role constants and routing config for the mobile app.
 */

export type UserRole =
  | 'FARMER'
  | 'PRADHAN'
  | 'BDO'
  | 'AGRICULTURE_OFFICER'
  | 'HORTICULTURE_OFFICER'
  | 'DISTRICT_STATE_OFFICIAL'
  | 'KVK_LAB_EXPERT'

export const FIELD_ROLES: UserRole[] = ['FARMER', 'PRADHAN']
export const OFFICER_ROLES: UserRole[] = [
  'BDO',
  'AGRICULTURE_OFFICER',
  'HORTICULTURE_OFFICER',
  'DISTRICT_STATE_OFFICIAL',
  'KVK_LAB_EXPERT',
]

export const ROLE_LABELS: Record<UserRole, string> = {
  FARMER:                  'Farmer',
  PRADHAN:                 'Pradhan (Village Head)',
  BDO:                     'Block Development Officer',
  AGRICULTURE_OFFICER:     'Agriculture Officer',
  HORTICULTURE_OFFICER:    'Horticulture Officer',
  DISTRICT_STATE_OFFICIAL: 'District / State Official',
  KVK_LAB_EXPERT:          'KVK / Lab Expert',
}

export const SUPPORTED_LANGUAGES = [
  { code: 'hi', label: 'हिंदी (Hindi)',       flag: '🇮🇳' },
  { code: 'en', label: 'English',             flag: '🔤' },
  { code: 'mr', label: 'मराठी (Marathi)',      flag: '🌺' },
  { code: 'pa', label: 'ਪੰਜਾਬੀ (Punjabi)',     flag: '🌾' },
  { code: 'te', label: 'తెలుగు (Telugu)',      flag: '🌿' },
  { code: 'ta', label: 'தமிழ் (Tamil)',       flag: '🌴' },
  { code: 'kn', label: 'ಕನ್ನಡ (Kannada)',     flag: '🏵️' },
  { code: 'gu', label: 'ગુજરાતી (Gujarati)',  flag: '🦚' },
  { code: 'bn', label: 'বাংলা (Bengali)',      flag: '🌸' },
  { code: 'or', label: 'ଓଡ଼ିଆ (Odia)',        flag: '🪷' },
] as const
