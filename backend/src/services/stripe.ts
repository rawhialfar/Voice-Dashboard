import {stripe} from "../auth/authClient";
import {supabase} from "../auth/authClient";


const findPriceIdByProductName = async (productName: string) => {
  const products = await stripe.products.list({ limit: 100 });
  const product = products.data.find(p => p.name === productName);

  if (!product) { throw new Error(`No product found with name "${productName}"`);}

  const prices = await stripe.prices.list({ product: product.id, limit: 100 });
  const price = prices.data[0];

  if (!price) {throw new Error(`No price found for product "${productName}"`);}

  return price.id;
};

export const associatePaymentMethod = async (paymentMethod: string, userId: string) => {

    const {data, error} = await supabase
    .from('_UserToStripeCustomers')
    .select('*')
    .eq('userId',userId)

    if (!data || data.length === 0 || error) throw new Error("User has no customerId, contact Admin");

    
    const attachingPaymentMethod = await stripe.paymentMethods.attach(paymentMethod,{
        customer: data[0].customerId
    })
    await stripe.customers.update(data[0].customerId, {
    invoice_settings: {
        default_payment_method: paymentMethod,
    },
});
    if (!attachingPaymentMethod) throw new Error("Unable to attach payment method");
}

export const cancelPaymentMethod = async (userId: string) => {
    const {data, error} = await supabase
    .from('_UserToStripeCustomers')
    .select("*")
    .eq('userId',userId);
    if (!data || data.length === 0 || error) throw new Error("User has no customerId, contact Admin");
    
    const paymentMethods = await stripe.customers.listPaymentMethods(data[0].customerId)
    if (!paymentMethods) throw new Error("Customer does not have a payment method");

    const detachingPaymentMethod = await stripe.paymentMethods.detach(paymentMethods.data[0].id)
    if (!detachingPaymentMethod) throw new Error("Failed to detach payment method");
}

export const createSubscription = async (userId: string, subscriptionPlan: string) => {
    let priceId = "";
    

    const {data, error} = await supabase
    .from('_UserToStripeCustomers')
    .select('*')
    .eq('userId',userId)
    if (!data || data.length === 0 || error) throw new Error("User has no customerId, contact Admin");
    
    priceId = await findPriceIdByProductName(subscriptionPlan);
    
    if (!priceId) throw new Error("Not a valid subscription type");

    
    await stripe.subscriptions.create({
        customer: data[0].customerId,
        items : [{
            price: priceId
        }]
    })
}


export const getSubscription = async (userId: string) => {
    const {data,error} = await supabase
    .from('_UserToStripeCustomers')
    .select('*')
    .eq('userId',userId)
    if (!data || data.length === 0 || error) throw new Error("User has no customerId, contact Admin");

    const subscriptions = await stripe?.subscriptions.list({customer: data[0].customerId});
    if (subscriptions?.data.length === 0) throw new Error("Customer does not have a subscription");

    const productId = subscriptions?.data[0].items.data[0].plan.product;
    if (!productId || typeof productId !== "string") throw new Error ("Error in subscription within stripe data");

    const product = await stripe.products.retrieve(productId);
    if (!product) throw new Error("Customer has no subscription");

    return product;
}

export const cancelSubscription = async (userId: string, subscriptionPlan: string) => {
    let priceId = "";
    

    const {data, error} = await supabase
    .from('_UserToStripeCustomers')
    .select('*')
    .eq('userId',userId)
    if (!data || data.length === 0 || error) throw new Error("User has no customerId, contact Admin");
    
    priceId = await findPriceIdByProductName(subscriptionPlan);

    if (!priceId) throw new Error("Not a valid subscription type");


    const subscriptions = await stripe.subscriptions.list({
        customer: data[0].customerId,
        price: priceId
    });
    if (!subscriptions) throw new Error("Customer is not subscribed");


    const cancelThisSubscription = await stripe.subscriptions.cancel(subscriptions.data[0].id);
    if (!cancelThisSubscription) throw new Error("Customer has not been unsubscribed")

}


export const getlastFourDigitsOnCard = async (userId: string) => {
    const {data, error} = await supabase
    .from('_UserToStripeCustomers')
    .select('*')
    .eq('userId',userId)
    if (!data || data.length === 0 || error) throw new Error("User has no customerId, contact Admin");

    const paymentMethods = await stripe.customers.listPaymentMethods(data[0].customerId)
    if (!paymentMethods) throw new Error("Customer does not have a payment method");
    return paymentMethods.data[0].card;
}

export const getAllInvoicesForCustomer = async (userId: string) => {
    const {data, error} = await supabase
    .from('_UserToStripeCustomers')
    .select('*')
    .eq('userId',userId)
    if (!data || data.length === 0 || error) throw new Error("User has no customerId, contact Admin");
    
    const customerId = data[0].customerId;

    const invoices = await stripe.invoices.list({limit: 12, customer: customerId})
    if (!invoices) throw new Error("User has no invoices");

    return invoices;
}

export const getMostRecentPaymentDate = async (userId: string) => {
    const {data, error} = await supabase
    .from('_UserToStripeCustomers')
    .select('*')
    .eq('userId',userId)
    if (!data || data.length === 0 || error) throw new Error("User has no customerId, contact Admin");

    const customerId = data[0].customerId;

    const invoice = await stripe.invoices.list({limit: 1, customer: customerId});
    if (!invoice) throw new Error("User has no invoices");
    const paidAt = await invoice.data[0].status_transitions.paid_at;
    if (!paidAt) throw new Error("Error retrieving payment date");

    return paidAt;
}

export const createPaymentIntent = async (amount: number) => {
    const amountInCents = Math.round(amount * 100);
    
    const paymentIntent = await stripe.paymentIntents.create({
        amount: amountInCents,
        currency: 'cad',
        automatic_payment_methods: {
            enabled: true,
        },
        setup_future_usage: 'off_session',
    });
    return paymentIntent;
}





