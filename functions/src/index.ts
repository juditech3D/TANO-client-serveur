import * as admin from "firebase-admin";
import * as functions from "firebase-functions";
admin.initializeApp();

export const setUserRole = functions.https.onCall(async (data, context) => {
  if (!context.auth || context.auth.token.role !== "ADMIN") {
    throw new functions.https.HttpsError("permission-denied", "Admin only");
  }
  const { uid, role, customerId } = data as { uid:string; role:"ADMIN"|"MECHANIC"|"CUSTOMER"; customerId?:string };
  await admin.auth().setCustomUserClaims(uid, { role, customerId: customerId || null });
  return { ok: true };
});
