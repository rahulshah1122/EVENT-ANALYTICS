import json
import re
from datetime import timedelta

from django.conf import settings
from django.utils import timezone
from rest_framework import serializers

from .models import Event

EVENT_TYPE_RE = re.compile(r"^[a-zA-Z0-9_.:-]+$")
FUTURE_TOLERANCE = timedelta(minutes=5)


class EventSerializer(serializers.ModelSerializer):
    # Declared on purpose so the client-supplied id stays writable and DRF
    # doesn't attach a UniqueValidator — dupes must hit the DB and 409.
    id = serializers.UUIDField()

    class Meta:
        model = Event
        fields = ["id", "user_id", "event_type", "payload", "timestamp", "created_at"]
        read_only_fields = ["created_at"]

    def validate_user_id(self, value: str) -> str:
        if not value or not value.strip():
            raise serializers.ValidationError("user_id must not be empty.")
        return value

    def validate_event_type(self, value: str) -> str:
        if not value or not EVENT_TYPE_RE.match(value):
            raise serializers.ValidationError(
                "event_type must match ^[a-zA-Z0-9_.:-]+$."
            )
        return value

    def validate_payload(self, value):
        if not isinstance(value, dict):
            raise serializers.ValidationError("payload must be a JSON object.")
        max_bytes = settings.MAX_PAYLOAD_BYTES
        size = len(json.dumps(value).encode("utf-8"))
        if size > max_bytes:
            raise serializers.ValidationError(
                f"payload exceeds the maximum allowed size of {max_bytes} bytes."
            )
        return value

    def validate_timestamp(self, value):
        # Naive timestamps are assumed to be UTC.
        if timezone.is_naive(value):
            value = timezone.make_aware(value, timezone.utc)
        if value > timezone.now() + FUTURE_TOLERANCE:
            raise serializers.ValidationError(
                "timestamp must not be more than 5 minutes in the future."
            )
        return value


class EventTypeCountSerializer(serializers.Serializer):
    event_type = serializers.CharField()
    count = serializers.IntegerField()


class TimelineBucketSerializer(serializers.Serializer):
    hour = serializers.DateTimeField()
    count = serializers.IntegerField()


class AnalyticsSerializer(serializers.Serializer):
    window_hours = serializers.IntegerField()
    generated_at = serializers.DateTimeField()
    total_events = serializers.IntegerField()
    counts_by_type = EventTypeCountSerializer(many=True)
    timeline = TimelineBucketSerializer(many=True)


class HealthSerializer(serializers.Serializer):
    status = serializers.ChoiceField(choices=["ok", "error"])
