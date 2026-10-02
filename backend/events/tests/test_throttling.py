import pytest
from django.test import override_settings
from django.urls import reverse
from rest_framework.test import APIClient

pytestmark = pytest.mark.django_db


@pytest.fixture
def client():
    return APIClient()


@override_settings(
    REST_FRAMEWORK={
        "DEFAULT_RENDERER_CLASSES": ["rest_framework.renderers.JSONRenderer"],
        "DEFAULT_PARSER_CLASSES": ["rest_framework.parsers.JSONParser"],
        "EXCEPTION_HANDLER": "events.exceptions.custom_exception_handler",
        "DEFAULT_THROTTLE_CLASSES": ["events.throttling.ClientIPRateThrottle"],
        "DEFAULT_THROTTLE_RATES": {"client_ip": "30/min"},
        "NUM_PROXIES": 1,
    }
)
def test_31st_request_in_a_minute_is_throttled(client):
    url = reverse("events-list-create")

    for _ in range(30):
        response = client.get(url)
        assert response.status_code == 200

    response = client.get(url)
    assert response.status_code == 429
    assert response.data["error"]["code"] == "rate_limited"
    assert "Retry-After" in response
