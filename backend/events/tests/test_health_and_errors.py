from unittest.mock import patch

import pytest
from django.db.utils import OperationalError
from django.urls import reverse
from rest_framework.test import APIClient

pytestmark = pytest.mark.django_db


@pytest.fixture
def client():
    return APIClient()


def test_health_check_ok(client):
    response = client.get(reverse("health"))
    assert response.status_code == 200
    assert response.data == {"status": "ok"}


def test_health_check_db_down_returns_503(client):
    with patch("events.views.connection") as mock_connection:
        mock_connection.cursor.side_effect = OperationalError("db down")
        response = client.get(reverse("health"))
    assert response.status_code == 503
    assert response.data == {"status": "error"}


def test_list_events_db_down_returns_503_with_error_envelope(client):
    with patch("events.views.Event.objects.all", side_effect=OperationalError("db down")):
        response = client.get(reverse("events-list-create"))
    assert response.status_code == 503
    assert response.data["error"]["code"] == "service_unavailable"


def test_malformed_json_body_returns_400(client):
    response = client.post(
        reverse("events-list-create"),
        data="{not valid json",
        content_type="application/json",
    )
    assert response.status_code == 400
    assert response.data["error"]["code"] == "validation_error"


def test_404_for_unknown_route_has_error_envelope(client):
    response = client.get("/api/does-not-exist")
    assert response.status_code == 404
    assert response.json()["error"]["code"] == "not_found"
