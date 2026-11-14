declare module "@paystack/inline-js" {
  interface PaystackTransactionCallbacks {
    onSuccess?: (transaction: { reference?: string; status?: string }) => void;
    onLoad?: (response: { id?: string; accessCode?: string }) => void;
    onCancel?: () => void;
    onError?: (error: { message?: string }) => void;
  }

  export default class PaystackPop {
    resumeTransaction(accessCode: string, callbacks?: PaystackTransactionCallbacks): void;
  }
}
