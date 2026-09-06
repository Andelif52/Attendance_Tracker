import admin from "firebase-admin";
import fs from "fs";
import path from "path";

import { env } from "./env.js";

const credentialsPath = path.resolve(
  process.cwd(),
  env.firebase.credentialsPath
);

const serviceAccount = JSON.parse(
  fs.readFileSync(credentialsPath, "utf-8")
);

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    projectId: env.firebase.projectId,
  });
}

export const db = admin.firestore();