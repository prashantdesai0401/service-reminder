import type { CategoryId } from '@/constants/categories';
import type { ReminderInput } from '@/db/reminders';
import { addInterval, todayKey, type RepeatUnit } from '@/lib/dates';

/** Ready-made item + reminder pairs so common things can be set up in two taps. */
export const TEMPLATES = [
  { id: 'bike', name: 'Bike', category: 'vehicle', title: 'Service', every: 1, unit: 'years' },
  { id: 'car', name: 'Car', category: 'vehicle', title: 'Service', every: 1, unit: 'years' },
  {
    id: 'insurance',
    name: 'Vehicle insurance',
    category: 'vehicle',
    title: 'Insurance renewal',
    every: 1,
    unit: 'years',
  },
  {
    id: 'puc',
    name: 'Pollution certificate (PUC)',
    category: 'vehicle',
    title: 'PUC renewal',
    every: 6,
    unit: 'months',
  },
  {
    id: 'inverter',
    name: 'Inverter battery',
    category: 'power',
    title: 'Top up distilled water',
    every: 45,
    unit: 'days',
  },
  {
    id: 'ac',
    name: 'Air conditioner',
    category: 'appliance',
    title: 'Service',
    every: 6,
    unit: 'months',
  },
  {
    id: 'purifier',
    name: 'Water purifier',
    category: 'appliance',
    title: 'Filter change',
    every: 6,
    unit: 'months',
  },
  {
    id: 'chimney',
    name: 'Kitchen chimney',
    category: 'appliance',
    title: 'Filter cleaning',
    every: 3,
    unit: 'months',
  },
] as const satisfies readonly {
  id: string;
  name: string;
  category: CategoryId;
  title: string;
  every: number;
  unit: RepeatUnit;
}[];

export type TemplateId = (typeof TEMPLATES)[number]['id'];

export function getTemplate(id: string | undefined) {
  return TEMPLATES.find((t) => t.id === id) ?? null;
}

/** The reminder form's starting values for a template: repeating, first due one interval from today. */
export function templateReminder(id: string | undefined): ReminderInput | undefined {
  const t = getTemplate(id);
  if (!t) return undefined;
  return {
    title: t.title,
    type: 'repeat',
    due_date: addInterval(todayKey(), t.every, t.unit),
    repeat_every: t.every,
    repeat_unit: t.unit,
    notify_days_before: [7, 1, 0],
    prepaid: false,
    amount_paid: null,
    provider_name: null,
    provider_phone: null,
  };
}
