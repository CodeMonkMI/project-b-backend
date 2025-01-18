export const REQUEST_SERVICE =
  process.env.DONATION_REQUEST_SERVICE_URL || "http://localhost:5001";
export const NOTIFICATION_SERVICE =
  process.env.NOTIFICATION_SERVICE_URL || "http://localhost:5003";
export const SALT_ROUND = process.env.SALT_ROUND || "10";
