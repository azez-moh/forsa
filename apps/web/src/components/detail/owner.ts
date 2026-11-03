import { users, type Opportunity } from '@forsa/data';
export type { Opportunity };
export const getUser = (id: string) => users.find((u) => u.id === id);
