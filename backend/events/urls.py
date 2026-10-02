from django.urls import path

from .views import AnalyticsView, EventListCreateView, HealthView

urlpatterns = [
    path("health", HealthView.as_view(), name="health"),
    # register analytics above any events/<id> route
    path("events/analytics", AnalyticsView.as_view(), name="events-analytics"),
    path("events", EventListCreateView.as_view(), name="events-list-create"),
]
