import { CUSTOMER_CONTACTS } from '@/data/mockDashboard'

export type CustomerContact = (typeof CUSTOMER_CONTACTS)[number]
export type CustomerTransaction = CustomerContact['transactions'][number]
