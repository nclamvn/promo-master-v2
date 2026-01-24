export const API_URL = import.meta.env.VITE_API_URL || '/api';

export const PROMOTION_STATUS_OPTIONS = [
  { value: 'DRAFT', label: 'Draft', color: 'gray' },
  { value: 'PLANNED', label: 'Planned', color: 'blue' },
  { value: 'CONFIRMED', label: 'Confirmed', color: 'indigo' },
  { value: 'EXECUTING', label: 'Executing', color: 'green' },
  { value: 'COMPLETED', label: 'Completed', color: 'emerald' },
  { value: 'CANCELLED', label: 'Cancelled', color: 'red' },
] as const;

export const CLAIM_STATUS_OPTIONS = [
  { value: 'PENDING', label: 'Pending', color: 'yellow' },
  { value: 'MATCHED', label: 'Matched', color: 'blue' },
  { value: 'APPROVED', label: 'Approved', color: 'green' },
  { value: 'DISPUTED', label: 'Disputed', color: 'orange' },
  { value: 'SETTLED', label: 'Settled', color: 'emerald' },
  { value: 'REJECTED', label: 'Rejected', color: 'red' },
] as const;

export const CHANNEL_OPTIONS = [
  { value: 'MT', label: 'Modern Trade' },
  { value: 'GT', label: 'General Trade' },
  { value: 'ECOMMERCE', label: 'E-Commerce' },
  { value: 'HORECA', label: 'HORECA' },
  { value: 'OTHER', label: 'Other' },
] as const;

export const FUND_TYPE_OPTIONS = [
  { value: 'FIXED', label: 'Fixed (On-Invoice)' },
  { value: 'VARIABLE', label: 'Variable (Off-Invoice)' },
] as const;

export const TACTIC_TYPE_OPTIONS = [
  { value: 'DISCOUNT', label: 'Discount' },
  { value: 'REBATE', label: 'Rebate' },
  { value: 'DISPLAY', label: 'Display' },
  { value: 'LISTING_FEE', label: 'Listing Fee' },
  { value: 'COOP_ADVERTISING', label: 'Co-op Advertising' },
  { value: 'SAMPLING', label: 'Sampling' },
  { value: 'OTHER', label: 'Other' },
] as const;
