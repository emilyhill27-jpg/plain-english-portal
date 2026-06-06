import {
  GraduationCap,
  Scale,
  HandHelping,
  ShieldCheck,
  Stethoscope,
  Landmark,
} from 'lucide-react'

/**
 * Category definitions — single source of truth.
 * Used on the public site and in the organisation portal.
 *
 * Each category has:
 *  - key:    stable identifier (used in code and data)
 *  - label:  display name
 *  - Icon:   Lucide icon component
 *  - bg:     soft tinted background colour
 *  - border: left-border and icon colour
 *  - docs:   example document types (for marketing pages)
 */
export const CATEGORIES = [
  {
    key: 'schools',
    label: 'Schools',
    Icon: GraduationCap,
    bg: '#EFF3FB',
    border: '#4A6FA5',
    docs: 'Enrolment forms, consent forms, school reports',
  },
  {
    key: 'community_law',
    label: 'Community law',
    Icon: Scale,
    bg: '#EEF5F0',
    border: '#4A8C5C',
    docs: 'Legal summaries, rights notices, process guides',
  },
  {
    key: 'citizens_advice',
    label: 'Citizens Advice',
    Icon: HandHelping,
    bg: '#EDF5F4',
    border: '#3D8B8B',
    docs: 'Benefit letters, tenancy agreements, complaints forms',
  },
  {
    key: 'insurance',
    label: 'Insurance brokers',
    Icon: ShieldCheck,
    bg: '#F3EEF5',
    border: '#7D5A8C',
    docs: 'Policy documents, claim forms, disclosure statements',
  },
  {
    key: 'gp_practices',
    label: 'GP practices',
    Icon: Stethoscope,
    bg: '#FBF0EE',
    border: '#B06B5A',
    docs: 'Patient letters, consent forms, referral notices',
  },
  {
    key: 'councils',
    label: 'Councils',
    Icon: Landmark,
    bg: '#F4F1ED',
    border: '#7A6F5A',
    docs: 'Rate notices, consent applications, bylaw summaries',
  },
]

/** Look up a category by key. Returns undefined if not found. */
export function getCategoryByKey(key) {
  return CATEGORIES.find(c => c.key === key)
}
