import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function validateMobileNumber(mobileNumber: string): boolean {
  if (!mobileNumber) return false;

  // Remove any spaces, dashes or other non-digit characters
  const cleanNumber = mobileNumber.replace(/\D/g, "");

  // Check if the number is 10 digits and starts with 05
  const isValid = /^05\d{8}$/.test(cleanNumber);

  if (!isValid) {
    console.info(
      `Invalid mobile number format: ${mobileNumber}. Mobile numbers should be 10 digits starting with 05.`
    );
  }

  return isValid;
}

export function padCountryCode(mobileNumber: string): string {
  if (mobileNumber.startsWith("05")) {
    // Eliminate 0 and add 966 to the beginning of the number
    return `966${mobileNumber.replace("0", "")}`;
  }

  return mobileNumber;
}
