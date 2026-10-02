import uuid

from django.utils import timezone

from events.models import Event


def make_event(**overrides):
    defaults = {
        "id": uuid.uuid4(),
        "user_id": "user_1",
        "event_type": "user.login",
        "payload": {"source": "web"},
        "timestamp": timezone.now(),
    }
    defaults.update(overrides)
    return Event.objects.create(**defaults)


def event_payload(**overrides):
    defaults = {
        "id": str(uuid.uuid4()),
        "user_id": "user_1",
        "event_type": "user.login",
        "payload": {"source": "web"},
        "timestamp": timezone.now().isoformat(),
    }
    defaults.update(overrides)
    return defaults
