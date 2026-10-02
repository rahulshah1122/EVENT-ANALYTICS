"""Aggregation logic, kept out of the views so it's easy to unit test."""
from __future__ import annotations

from datetime import timedelta

from django.db.models import Count
from django.db.models.functions import TruncHour
from django.utils import timezone

from .models import Event

TOP_EVENT_TYPES_LIMIT = 10


def get_analytics(hours: int) -> dict:
    """Counts and a zero-filled hourly timeline for the last `hours` hours."""
    now = timezone.now()
    window_start = now - timedelta(hours=hours)

    queryset = Event.objects.filter(timestamp__gte=window_start, timestamp__lte=now)

    total_events = queryset.count()

    counts_by_type = list(
        queryset.values("event_type")
        .annotate(count=Count("id"))
        .order_by("-count", "event_type")[:TOP_EVENT_TYPES_LIMIT]
    )

    timeline = _build_hourly_timeline(queryset, window_start, now, hours)

    return {
        "window_hours": hours,
        "generated_at": now,
        "total_events": total_events,
        "counts_by_type": counts_by_type,
        "timeline": timeline,
    }


def _build_hourly_timeline(queryset, window_start, now, hours: int) -> list[dict]:
    """Hourly buckets between window_start and now, zero-filled for gaps."""
    raw_buckets = (
        queryset.annotate(bucket=TruncHour("timestamp"))
        .values("bucket")
        .annotate(count=Count("id"))
        .order_by("bucket")
    )
    bucket_map = {row["bucket"]: row["count"] for row in raw_buckets}

    start_hour = window_start.replace(minute=0, second=0, microsecond=0)
    end_hour = now.replace(minute=0, second=0, microsecond=0)

    timeline = []
    current = start_hour
    while current <= end_hour:
        timeline.append({"hour": current, "count": bucket_map.get(current, 0)})
        current += timedelta(hours=1)

    return timeline
