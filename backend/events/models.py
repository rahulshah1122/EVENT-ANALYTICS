from django.db import models


class Event(models.Model):
    """A single user activity log entry."""

    id = models.UUIDField(primary_key=True, editable=False)
    user_id = models.CharField(max_length=128, db_index=True)
    event_type = models.CharField(max_length=64, db_index=True)
    payload = models.JSONField(default=dict)
    timestamp = models.DateTimeField(db_index=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-timestamp"]
        indexes = [
            models.Index(fields=["event_type", "-timestamp"], name="evt_type_ts_idx"),
        ]

    def __str__(self) -> str:
        return f"{self.event_type} ({self.id})"
