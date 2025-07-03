import axios from "axios";
import { Expo } from "expo-server-sdk";
import { Socket } from "socket.io";

const expo = new Expo();

type MemberProps = {
  chatId: string;
  createdAt: Date;
  updatedAt: Date;
  userId: string;
  isAdmin: boolean;
  chat: {
    id: string;
    name: string;
    description: string | null;
    image: {
      url: string;
      blur: string | null;
      width: number | null;
      height: number | null;
    } | null;
    type: "chat" | "group";
    createdAt: Date;
    updatedAt: Date;
  };
  user: {
    id: string;
    name: string | null;
    image: string | null;
    regNo: string | null;
    email: string | null;
    phone: string | null;
    notificationIds: string[];
  };
}[];

const addMessage = async (
  socket: Socket,
  roomId: string,
  userId: string,
  name: string,
  message: string
) => {
  const members: MemberProps = await axios
    .get(`${process.env.DB_SERVER}/chat/member?limit=10000&chat=${roomId}`)
    .then((res) => res?.data?.data);

  const messages = [];

  const pushTokens: string[] = members
    .map((member) => {
      console.log(member.user.name);
      if (member.user.id !== userId) return member.user.notificationIds;
      return null;
    })
    .flat()
    .filter((token): token is string => token !== null);

  for (const pushToken of pushTokens) {
    if (!Expo.isExpoPushToken(pushToken)) {
      console.warn(`Invalid token: ${pushToken}`);
      continue;
    }

    messages.push({
      to: pushToken,
      sound: "default",
      title: name || "New Message",
      body: message || "",
      data: {
        url: `/(stack)/(protected)/${roomId}`,
      },
    });
  }

  try {
    const tickets = [];
    const chunks = expo.chunkPushNotifications(messages);

    for (const chunk of chunks) {
      const ticketChunk = await expo.sendPushNotificationsAsync(chunk);
      tickets.push(...ticketChunk);
    }

    // Optional: Handle receipt checking
    let receiptIds = [];
    for (let ticket of tickets) {
      if (ticket.status === "ok") {
        receiptIds.push(ticket.id);
      }
    }

    const receiptIdChunks = expo.chunkPushNotificationReceiptIds(receiptIds);

    for (const chunk of receiptIdChunks) {
      const receipts = await expo.getPushNotificationReceiptsAsync(chunk);
      for (const [id, receipt] of Object.entries(receipts)) {
        if (receipt.status === "error") {
          console.error(
            `Receipt ${id} failed:`,
            receipt.message,
            receipt.details
          );
        }
      }
    }
  } catch (error) {
    console.error("Push error:", error);
  }

  socket.to(roomId).emit("add-message", roomId);
  return;
};

export default addMessage;
