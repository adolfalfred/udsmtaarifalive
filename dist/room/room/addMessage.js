import axios from "axios";
import { Expo } from "expo-server-sdk";
const expo = new Expo();
const addMessage = async (socket, roomId, userId, name, message) => {
    const members = await axios
        .get(`${process.env.DB_SERVER}/chat/member?limit=10000&chat=${roomId}`)
        .then((res) => res?.data?.data);
    const messages = [];
    const pushTokens = members
        .map((member) => {
        console.log(member.user.name);
        if (member.user.id !== userId)
            return member.user.notificationIds;
        return null;
    })
        .flat()
        .filter((token) => token !== null);
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
                    console.error(`Receipt ${id} failed:`, receipt.message, receipt.details);
                }
            }
        }
    }
    catch (error) {
        console.error("Push error:", error);
    }
    socket.to(roomId).emit("add-message", roomId);
    return;
};
export default addMessage;
//# sourceMappingURL=addMessage.js.map