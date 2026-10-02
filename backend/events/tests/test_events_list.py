from datetime import timedelta

import pytest
from django.urls import reverse
from django.utils import timezone
from rest_framework.test import APIClient

from events.tests.factories import make_event

pytestmark = pytest.mark.django_db


@pytest.fixture
def client():
    return APIClient()


def test_list_pagination_defaults(client):
    for _ in range(25):
        make_event()
    response = client.get(reverse("events-list-create"))
    assert response.status_code == 200
    assert response.data["count"] == 25
    assert response.data["page"] == 1
    assert response.data["limit"] == 20
    assert response.data["total_pages"] == 2
    assert len(response.data["results"]) == 20


def test_list_limit_is_capped_at_100(client):
    for _ in range(5):
        make_event()
    response = client.get(reverse("events-list-create"), {"limit": 500})
    assert response.status_code == 200
    assert response.data["limit"] == 100


def test_list_filter_by_event_type(client):
    make_event(event_type="user.login")
    make_event(event_type="user.logout")
    make_event(event_type="page.view")

    response = client.get(reverse("events-list-create"), {"event_type": "user.login,page.view"})
    assert response.status_code == 200
    assert response.data["count"] == 2
    returned_types = {e["event_type"] for e in response.data["results"]}
    assert returned_types == {"user.login", "page.view"}


def test_list_filter_by_date_range(client):
    now = timezone.now()
    make_event(timestamp=now - timedelta(days=5))
    recent = make_event(timestamp=now - timedelta(hours=1))

    response = client.get(
        reverse("events-list-create"),
        {
            "date_from": (now - timedelta(days=1)).isoformat(),
            "date_to": now.isoformat(),
        },
    )
    assert response.status_code == 200
    assert response.data["count"] == 1
    assert response.data["results"][0]["id"] == str(recent.id)


def test_list_invalid_date_range_returns_400(client):
    now = timezone.now()
    response = client.get(
        reverse("events-list-create"),
        {
            "date_from": now.isoformat(),
            "date_to": (now - timedelta(days=1)).isoformat(),
        },
    )
    assert response.status_code == 400
    assert response.data["error"]["code"] == "validation_error"


def test_list_malformed_date_returns_400(client):
    response = client.get(reverse("events-list-create"), {"date_from": "not-a-date"})
    assert response.status_code == 400


def test_list_search_matches_payload_and_user_id(client):
    make_event(user_id="alice", payload={"note": "hello world"})
    make_event(user_id="bob", payload={"note": "unrelated"})

    response = client.get(reverse("events-list-create"), {"search": "hello"})
    assert response.status_code == 200
    assert response.data["count"] == 1

    response = client.get(reverse("events-list-create"), {"search": "alice"})
    assert response.status_code == 200
    assert response.data["count"] == 1


def test_list_search_matches_event_type(client):
    make_event(event_type="page.view")
    make_event(event_type="user.login")

    response = client.get(reverse("events-list-create"), {"search": "page.view"})
    assert response.status_code == 200
    assert response.data["count"] == 1


def test_list_search_accepts_cleaned_display_forms(client):
    # user types what they see: "User 31" should match user_id "user_31"
    make_event(user_id="user_31")
    make_event(user_id="user_7")

    response = client.get(reverse("events-list-create"), {"search": "User 31"})
    assert response.status_code == 200
    assert response.data["count"] == 1

    # "Page View" should match event_type "page.view"
    make_event(event_type="page.view")
    response = client.get(reverse("events-list-create"), {"search": "Page View"})
    assert response.status_code == 200
    assert response.data["count"] == 1


def test_list_newest_first(client):
    now = timezone.now()
    older = make_event(timestamp=now - timedelta(hours=2))
    newer = make_event(timestamp=now - timedelta(minutes=1))

    response = client.get(reverse("events-list-create"))
    ids = [e["id"] for e in response.data["results"]]
    assert ids.index(str(newer.id)) < ids.index(str(older.id))
