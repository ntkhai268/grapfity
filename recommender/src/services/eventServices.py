
from src.database.db import del_events_of_track_id, del_track_metadata

import asyncio

import logging

logger = logging.getLogger(__name__)

async def delete_event_relative_track_id(track_id):
    try:
        res_del_events, res_del_track_metadata = await asyncio.gather(
            del_events_of_track_id(track_id),
            del_track_metadata(track_id)
        )
    except Exception as e:
        # Log lỗi cụ thể nếu cần
        logger.error(f"Error deleting related data for track {track_id}: {e}")
        raise

    return {
        "statusCode": 200,
        "message": "Deleted"
    }
