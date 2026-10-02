import uuid

import pytest
from django.urls import reverse
from rest_framework.test import APIClient

from events.models import Event
from events.tests.factories import event_payload

pytestmark = pytest.mark.django_db


@pytest.fixture
def client():
    return APIClient()


def test_create_event_success(client):
    payload = event_payload()
    response = client.post(reverse("events-list-create"), payload, format="json")
    assert response.status_code == 201
    assert Event.objects.filter(id=payload["id"]).exists()


def test_create_event_invalid_uuid(client):
    payload = event_payload(id="not-a-uuid")
    response = client.post(reverse("events-list-create"), payload, format="json")
    assert response.status_code == 400
    assert response.data["error"]["code"] == "validation_error"
    assert "id" in response.data["error"]["details"]


def test_create_event_missing_fields(client):
    response = client.post(reverse("events-list-create"), {}, format="json")
    assert response.status_code == 400
    details = response.data["error"]["details"]
    assert "id" in details
    assert "user_id" in details
    assert "event_type" in details
    assert "timestamp" in details


def test_create_event_non_object_payload(client):
    payload = event_payload(payload=["not", "a", "dict"])
    response = client.post(reverse("events-list-create"), payload, format="json")
    assert response.status_code == 400
    assert "payload" in response.data["error"]["details"]


def test_create_event_future_timestamp_rejected(client):
    from datetime import timedelta

    from django.utils import timezone

    future = (timezone.now() + timedelta(minutes=10)).isoformat()
    payload = event_payload(timestamp=future)
    response = client.post(reverse("events-list-create"), payload, format="json")
    assert response.status_code == 400
    assert "timestamp" in response.data["error"]["details"]


def test_create_event_near_future_timestamp_allowed(client):
    from datetime import timedelta

    from django.utils import timezone

    near_future = (timezone.now() + timedelta(minutes=2)).isoformat()
    payload = event_payload(timestamp=near_future)
    response = client.post(reverse("events-list-create"), payload, format="json")
    assert response.status_code == 201


def test_create_event_invalid_event_type(client):
    payload = event_payload(event_type="not a valid type!")
    response = client.post(reverse("events-list-create"), payload, format="json")
    assert response.status_code == 400
    assert "event_type" in response.data["error"]["details"]


def test_create_event_duplicate_id_returns_409(client):
    payload = event_payload(id=str(uuid.uuid4()))
    first = client.post(reverse("events-list-create"), payload, format="json")
    assert first.status_code == 201

    second = client.post(reverse("events-list-create"), payload, format="json")
    assert second.status_code == 409
    assert second.data["error"]["code"] == "duplicate_event"


def test_create_event_payload_too_large(client, settings):
    settings.MAX_PAYLOAD_BYTES = 10
    payload = event_payload(payload={"a": "x" * 100})
    response = client.post(reverse("events-list-create"), payload, format="json")
    assert response.status_code == 400
    assert "payload" in response.data["error"]["details"]
