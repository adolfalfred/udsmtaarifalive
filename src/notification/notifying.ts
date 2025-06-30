import { Request, Response } from "express";
import { Expo } from "expo-server-sdk";

const expo = new Expo();

const notifyingFxn = async (req: Request, res: Response) => {
  const { pushTokens, title, body, data } = req.body;

  if (!Array.isArray(pushTokens) || !title || !body) {
    res.status(400).json({ error: "Missing required fields" }).end();
    return;
  }

  const messages = [];

  for (const pushToken of pushTokens) {
    if (!Expo.isExpoPushToken(pushToken)) {
      console.warn(`Invalid token: ${pushToken}`);
      continue;
    }

    messages.push({
      to: pushToken,
      sound: "default",
      title,
      body,
      data: data || {},
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

    res.json({ success: true, tickets });
    return;
  } catch (error) {
    console.error("Push error:", error);
    res.status(500).json({ error: "Failed to send push notifications" });
    return;
  }
};

export default notifyingFxn;
