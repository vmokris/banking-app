import type { Contact, FDRate } from './data/mockData';

export type PayStep = 'search' | 'select' | 'enter_amount' | 'confirm' | 'success';
export type FDStep  = 'select_tenure' | 'enter_amount' | 'confirm' | 'success';

export interface PaymentState {
  step: PayStep;
  query: string;
  matches: Contact[];
  selected?: Contact;
  amount?: number;
  txRef?: string;
}

export interface FDState {
  step: FDStep;
  selectedRate?: FDRate;
  amount?: number;
  maturity?: number;
  txRef?: string;
}

export type FlowAction =
  | { kind: 'select_contact'; contact: Contact }
  | { kind: 'set_amount'; amount: number }
  | { kind: 'confirm_payment' }
  | { kind: 'select_tenure'; rate: FDRate }
  | { kind: 'set_fd_amount'; amount: number }
  | { kind: 'confirm_fd' }
  | { kind: 'cancel' };

interface BaseMsg { id: string; time: Date; }
export interface TextMsg      extends BaseMsg { kind: 'text';       role: 'user' | 'ai'; text: string; }
export interface WidgetMsg    extends BaseMsg { kind: 'widget';     widget: 'balance' | 'transactions' | 'upcoming'; }
export interface PaymentMsg   extends BaseMsg { kind: 'payment';    state: PaymentState; }
export interface FDMsg        extends BaseMsg { kind: 'fd';         state: FDState; }
export interface SuggestionMsg extends BaseMsg { kind: 'suggestion'; text: string; paymentName?: string; amount?: number; }

export type ChatMessage = TextMsg | WidgetMsg | PaymentMsg | FDMsg | SuggestionMsg;
