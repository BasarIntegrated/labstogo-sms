// Test Philippine mobile number formatting
function formatPhilippineNumber(phoneNumber: string): string {
  // Remove all non-digits
  const digits = phoneNumber.replace(/\D/g, "");

  // Handle different input formats
  if (digits.startsWith("63")) {
    // Already has country code
    return `+${digits}`;
  } else if (digits.startsWith("0")) {
    // Remove leading 0 and add country code
    return `+63${digits.substring(1)}`;
  } else if (digits.length === 10) {
    // Assume it's a local number without 0
    return `+63${digits}`;
  }

  return phoneNumber; // Return as-is if format is unclear
}

// Test examples
const testNumbers = [
  "09171234567", // Globe format
  "09281234567", // Globe format
  "09123456789", // Smart format
  "639171234567", // With country code
  "+639171234567", // International format
];

console.log("🇵🇭 Philippine Mobile Number Formatting Test:");
console.log("==========================================");

testNumbers.forEach((number) => {
  const formatted = formatPhilippineNumber(number);
  console.log(`${number.padEnd(15)} → ${formatted}`);
});

console.log("\n✅ All numbers should format to +63XXXXXXXXXX");
console.log("📱 Use these formatted numbers in Twilio verification");
