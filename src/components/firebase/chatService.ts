import {
  collection,
  addDoc,
  query,
  orderBy,
  onSnapshot,
  getDocs,
  serverTimestamp,
  type Timestamp,
  limit as limitFn,
  doc,
  setDoc,
} from "firebase/firestore";

import { db } from "./config";

export type ChatMessage = {
  id?: string;
  text: string;
  senderId: string;
  senderName?: string | null;
  createdAt?: Timestamp | null;
};

export type Conversation = {
  id: string;
  name: string;
  avatar?: string;
};

type Driver = {
  _id?: string;
  id?: string;
  name?: string;
  driverCode?: string;
  contractorId?: { contractorCode?: string };
  avatar?: string;
  profileImage?: string;
};

export async function getConversationsFromFirestore(): Promise<Conversation[]> {
  const snapshot = await getDocs(collection(db, "chatrooms"));

  return snapshot.docs
    .map((conversation) => {
      const data = conversation.data() as Omit<Conversation, "id">;
      return {
        id: conversation.id,
        name: data.name ?? "Unknown",
        ...(data.avatar ? { avatar: data.avatar } : {}),
      };
    })
    .sort((a, b) => a.name.localeCompare(b.name));
}

export async function syncDriversToFirestore(drivers: Driver[]) {
  const errors: string[] = [];
  let synced = 0;

  await Promise.all(
    drivers.map(async (driver) => {
      const id = driver._id ?? driver.id;
      if (!id) {
        errors.push("A driver record has no id.");
        return;
      }

      try {
        await setDoc(
          doc(db, "chatrooms", String(id)),
          {
            name:
              driver.name ??
              driver.driverCode ??
              driver.contractorId?.contractorCode ??
              "Unknown",
            avatar: driver.avatar ?? driver.profileImage ?? null,
            updatedAt: serverTimestamp(),
          },
          { merge: true },
        );
        synced += 1;
      } catch (error) {
        errors.push(
          `Could not sync ${id}: ${error instanceof Error ? error.message : "Unknown error"}`,
        );
      }
    }),
  );

  return { synced, errors };
}

export async function sendMessage(
  roomId: string,
  message: Omit<ChatMessage, "id" | "createdAt">
) {
  const messagesRef = collection(
    db,
    "chatrooms",
    roomId,
    "messages"
  );

  const payload = {
    ...message,
    createdAt: serverTimestamp(),
  };

  const ref = await addDoc(messagesRef, payload);

  return ref.id;
}

export function subscribeToMessages(
  roomId: string,
  onUpdate: (messages: ChatMessage[]) => void,
  opts?: { limit?: number }
) {
  const messagesRef = collection(
    db,
    "chatrooms",
    roomId,
    "messages"
  );

  const q = opts?.limit
    ? query(
        messagesRef,
        orderBy("createdAt", "asc"),
        limitFn(opts.limit)
      )
    : query(
        messagesRef,
        orderBy("createdAt", "asc")
      );

  return onSnapshot(q, (snapshot) => {
    const messages = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...(doc.data() as Omit<ChatMessage, "id">),
    }));

    onUpdate(messages);
  });
}

export async function getMessages(
  roomId: string,
  limit?: number
) {
  const messagesRef = collection(
    db,
    "chatrooms",
    roomId,
    "messages"
  );

  const q = limit
    ? query(
        messagesRef,
        orderBy("createdAt", "asc"),
        limitFn(limit)
      )
    : query(
        messagesRef,
        orderBy("createdAt", "asc")
      );

  const snapshot = await getDocs(q);

  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...(doc.data() as Omit<ChatMessage, "id">),
  }));
}
