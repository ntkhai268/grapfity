import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';

// ✅ Enum loại sự kiện (exported)
export enum EventType {
  Click = 'click',
  Play = 'play',
  Comment = 'comment',
}

// ✅ Interface dữ liệu gửi đi
interface EventTrackingData {
  event_id: string;
  track_id: string;
  event_type: EventType;
  user_id: string;
  timestamp: string;
}

/**
 * Gửi sự kiện tracking tới server sử dụng Axios
 * @param trackId - ID của track
 * @param eventType - Loại sự kiện (enum)
 * @param userId - ID của người dùng
 */
export const sendEvent = async (
  trackId: string,
  eventType: EventType,
  userId: string
): Promise<any> => {
  const event: EventTrackingData = {
    event_id: uuidv4(),
    track_id: trackId,
    event_type: eventType,
    user_id: userId,
    timestamp: new Date().toISOString(),
  };
  console.log("ahihi",event)
  try {
    const response = await axios.post(
      'http://localhost:8080/api/event_tracking',
      { event },
      {
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

    console.log('Tracking event sent successfully:', response.data);
    return response.data;
  } catch (error: any) {
    console.error('Error sending tracking event:', error.message);
    // throw error;
  }
};
