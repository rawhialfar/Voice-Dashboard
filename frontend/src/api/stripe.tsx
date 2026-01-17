import axios from "axios";

const api = axios.create({
  baseURL: "/api/stripe",
  withCredentials: true,
});
export interface CancelSubscriptionPayload {
  subscriptionPlan: string;
}
export interface SubscribePayload {
  businessName: string;
  paymentMethod: string;
  subscriptionPlan: string;
}
export interface UpdatePaymentPayload {
  paymentMethod: string;
}

export interface UpdateSubscriptionPayload {
  paymentMethod: string;
  newSubscriptionPlan: string;
}

export interface GetLastFourPayload{
  expMonth: number,
  expYear: number,
  lastfour: String
}

const subscribePath = () => `/subscribe`;
const cancelSubscriptionPath = () => `/subscription/cancel`;
const getSubscriptionPath = () => `/subscription/get`;
const updateSubscriptionPath = () => `/subscription/update`;
const updatePaymentMethodPath = () => `/paymentMethod/update`;
const createPaymentIntentPath = () => `/create-payment-intent`;
const getLastFourDigitsPath = () => `/paymentMethod/getLastFour`;
const getCustomerInvoicesPath = () => `/customer/invoices`;
const getMinutesUsedInPeriodPath = () => `/getMinutesUsedInPeriod`;

export const subscribe = async (payload: SubscribePayload): Promise<void> => {
  await api.post<void>(subscribePath(), payload);
};

export const cancelSubscription = async (payload: CancelSubscriptionPayload): Promise<void> => {
  await api.post<void>(cancelSubscriptionPath(), payload);
};

export interface IGetSubscription {
  product: JSON; 
}

export const getSubscription = async (): Promise<IGetSubscription> => {
  const { data } = await api.get<IGetSubscription>(getSubscriptionPath());
  return data;
};

export const updateSubscription = async (payload: UpdateSubscriptionPayload): Promise<void> => {
  await api.post<void>(updateSubscriptionPath(), payload);
};

export const updatePaymentMethod = async (payload: UpdatePaymentPayload): Promise<void> => {
  await api.post<void>(updatePaymentMethodPath(), payload);
};

export const createPaymentIntent = async (amount: number) => {
  const { data } = await api.post<{ clientSecret: string }>(createPaymentIntentPath(), { amount });
  return data;
};

export const getLastFourDigitsOnCard = async () => {
  const { data } = await api.get<GetLastFourPayload>(getLastFourDigitsPath());
  return data;
};

export const customerInvoices = async () => {
  const { data } = await api.get<object>(getCustomerInvoicesPath());
  return data;
}

export const getMinutesUsedInPeriod = async () => {
  const { data } = await api.get<{ minutesUsed: number }>(getMinutesUsedInPeriodPath());
  return data;
}