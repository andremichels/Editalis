"use client";

const IUGU_ACCOUNT_ID = process.env.NEXT_PUBLIC_IUGU_ACCOUNT_ID || "";

let Iugu: any = null;

export async function loadIugu(): Promise<any> {
  if (Iugu) return Iugu;
  return new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = "https://js.iugu.com/v2";
    script.onload = () => {
      Iugu = (window as any).Iugu;
      Iugu.setAccountID(IUGU_ACCOUNT_ID);
      Iugu.setTestMode(true);
      resolve(Iugu);
    };
    script.onerror = () => reject(new Error("Failed to load iugu.js"));
    document.head.appendChild(script);
  });
}

export function tokenizeCard(card: {
  number: string;
  verification_value: string;
  first_name: string;
  last_name: string;
  month: string;
  year: string;
}): Promise<{ id: string }> {
  return new Promise((resolve, reject) => {
    Iugu.createPaymentToken(card, (response: any) => {
      if (response.errors) {
        reject(new Error(JSON.stringify(response.errors)));
      } else {
        resolve({ id: response.id });
      }
    });
  });
}
