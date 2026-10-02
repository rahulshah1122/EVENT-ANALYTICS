from datetime import timedelta

import pytest
from django.urls import reverse
from django.utils import timezone
from rest_framework.test import APIClient

from events.services import get_analytics
from events.tests.factories import make_event

pytestmark = pytest.mark.django_db


@pytest.fixture
def client():
    return APIClient()


def test_get_analytics_counts_by_type():
    now = timezone.now()
    make_event(event_type="user.login", timestamp=now - timedelta(hours=1))
    make_event(event_type="user.login", timestamp=now - timedelta(hours=2))
    make_event(event_type="page.view", timestamp=now - timedelta(hours=1))

    data = get_analytics(hours=24)

    assert data["total_events"] == 3
    by_type = {row["event_type"]: row["count"] for row in data["counts_by_type"]}
    assert by_type == {"user.login": 2, "page.view": 1}
    assert data["counts_by_type"][0]["event_type"] == "user.login"


def test_get_analytics_window_boundary_excludes_older_events():
    now = timezone.now()
    make_event(timestamp=now - timedelta(hours=23))
    make_event(timestamp=now - timedelta(hours=25))  # outside a 24h window

    data = get_analytics(hours=24)
    assert data["total_events"] == 1


def test_get_analytics_top_10_limit():
    now = timezone.now()
    for i in range(15):
        make_event(event_type=f"type_{i}", timestamp=now)

    data = get_analytics(hours=24)
    assert len(data["counts_by_type"]) == 10


def test_get_analytics_timeline_is_zero_filled():
    now = timezone.now()
    make_event(timestamp=now)

    data = get_analytics(hours=3)
    # timeline should have ~4 hourly buckets (3h window inclusive of both ends)
    assert len(data["timeline"]) >= 3
    counts = [bucket["count"] for bucket in data["timeline"]]
    assert sum(counts) == 1


def test_analytics_endpoint_defaults_to_24h(client):
    make_event()
    response = client.get(reverse("events-analytics"))
    assert response.status_code == 200
    assert response.data["window_hours"] == 24
    assert response.data["total_events"] == 1


def test_analytics_endpoint_rejects_out_of_range_hours(client):
    response = client.get(reverse("events-analytics"), {"hours": 200})
    assert response.status_code == 400
    assert response.data["error"]["code"] == "validation_error"

    response = client.get(reverse("events-analytics"), {"hours": 0})
    assert response.status_code == 400


def test_analytics_endpoint_rejects_non_integer_hours(client):
    response = client.get(reverse("events-analytics"), {"hours": "abc"})
    assert response.status_code == 400
