import { 
  collection, 
  doc, 
  setDoc, 
  deleteDoc, 
  updateDoc, 
  onSnapshot, 
  query, 
  orderBy, 
  limit 
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { FamilyChatMessage } from '../types';

export const CHAT_COLLECTION = 'chat_messages';

/**
 * Subscribes to real-time chat updates from Firebase Firestore.
 * Callback is invoked whenever messages are added, updated, or removed across all connected devices.
 */
export function subscribeToFirebaseChat(
  onMessagesUpdate: (messages: FamilyChatMessage[]) => void,
  onError?: (err: Error) => void
): () => void {
  try {
    const q = query(
      collection(db, CHAT_COLLECTION),
      orderBy('timestamp', 'asc'),
      limit(200)
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const messages: FamilyChatMessage[] = [];
        snapshot.forEach((docSnap) => {
          const data = docSnap.data() as any;
          messages.push({
            id: docSnap.id,
            sender: data.sender || data.senderName || 'Familia',
            senderRole: data.senderRole || data.senderId || 'regina',
            text: data.text || '',
            timestamp: data.timestamp || data.createdAt || new Date().toISOString(),
            isNoticeToMama: data.isNoticeToMama,
            imageDataUrl: data.imageDataUrl,
            reactions: data.reactions,
            replyTo: data.replyTo,
            reviewedByMama: data.reviewedByMama,
            mamaComment: data.mamaComment,
            mamaApprovedAt: data.mamaApprovedAt,
          });
        });
        onMessagesUpdate(messages);
      },
      (error) => {
        console.warn('[FirebaseChat] Snapshot listener notice:', error);
        if (onError) onError(error);
      }
    );

    return unsubscribe;
  } catch (err) {
    console.warn('[FirebaseChat] Subscription error:', err);
    return () => {};
  }
}

/**
 * Sends or updates a chat message in Firebase Firestore.
 * Automatically synchronizes with all active devices in real-time.
 */
export async function sendFirebaseMessage(message: FamilyChatMessage): Promise<void> {
  const docPath = `${CHAT_COLLECTION}/${message.id}`;
  try {
    const docRef = doc(db, CHAT_COLLECTION, message.id);
    
    // Clean payload so Firestore doesn't error on undefined properties,
    // and provide both sender/senderRole and senderName/senderId for compatibility
    const payload: Record<string, any> = {
      id: message.id,
      sender: message.sender,
      senderName: message.sender,
      senderRole: message.senderRole,
      senderId: message.senderRole,
      text: message.text,
      timestamp: message.timestamp || new Date().toISOString(),
      channelId: 'family-chat',
    };

    if (message.isNoticeToMama !== undefined) payload.isNoticeToMama = message.isNoticeToMama;
    if (message.imageDataUrl) payload.imageDataUrl = message.imageDataUrl;
    if (message.reactions) payload.reactions = message.reactions;
    if (message.replyTo) payload.replyTo = message.replyTo;
    if (message.reviewedByMama !== undefined) payload.reviewedByMama = message.reviewedByMama;
    if (message.mamaComment) payload.mamaComment = message.mamaComment;
    if (message.mamaApprovedAt) payload.mamaApprovedAt = message.mamaApprovedAt;

    await setDoc(docRef, payload, { merge: true });
  } catch (error) {
    console.error('[FirebaseChat] Failed to send message:', error);
    try {
      handleFirestoreError(error, OperationType.WRITE, docPath);
    } catch {
      // re-throw for caller handling
      throw error;
    }
  }
}

/**
 * Deletes a chat message from Firebase Firestore across all devices.
 */
export async function deleteFirebaseMessage(id: string): Promise<void> {
  const docPath = `${CHAT_COLLECTION}/${id}`;
  try {
    const docRef = doc(db, CHAT_COLLECTION, id);
    await deleteDoc(docRef);
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, docPath);
  }
}

/**
 * Adds or increments an emoji reaction on a message in Firebase Firestore.
 */
export async function updateFirebaseReaction(
  messageId: string, 
  emoji: string, 
  currentCount: number
): Promise<void> {
  const docPath = `${CHAT_COLLECTION}/${messageId}`;
  try {
    const docRef = doc(db, CHAT_COLLECTION, messageId);
    await updateDoc(docRef, {
      [`reactions.${emoji}`]: currentCount + 1,
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, docPath);
  }
}

/**
 * Marks a notice message as reviewed/approved by Mamá in Firebase Firestore.
 */
export async function approveFirebaseNotice(
  messageId: string, 
  comment?: string
): Promise<void> {
  const docPath = `${CHAT_COLLECTION}/${messageId}`;
  try {
    const docRef = doc(db, CHAT_COLLECTION, messageId);
    await updateDoc(docRef, {
      reviewedByMama: true,
      mamaComment: comment || '¡Aprobado por Mamá! 💕',
      mamaApprovedAt: new Date().toISOString(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, docPath);
  }
}
