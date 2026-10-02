import logging

from django.db import IntegrityError, connection, transaction
from django.db.utils import InterfaceError, OperationalError
from drf_spectacular.utils import OpenApiParameter, extend_schema
from rest_framework import status
from rest_framework.exceptions import ValidationError
from rest_framework.response import Response
from rest_framework.views import APIView

from .exceptions import DuplicateEventError
from .filters import apply_event_filters
from .models import Event
from .pagination import EventPagination
from .serializers import AnalyticsSerializer, EventSerializer, HealthSerializer
from .services import get_analytics

logger = logging.getLogger(__name__)


class EventListCreateView(APIView):
    """POST /api/events -> create an event.
    GET  /api/events -> paginated, filterable list of events.
    """

    @extend_schema(
        request=EventSerializer,
        responses={201: EventSerializer},
        summary="Create an event",
        description="Ingest a single user activity event. Validates the id (UUID), "
        "event_type (regex), payload (JSON object, size-limited), and timestamp "
        "(ISO 8601, not more than 5 minutes in the future).",
    )
    def post(self, request):
        serializer = EventSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        try:
            # savepoint: a dup-key error only rolls back this insert
            with transaction.atomic():
                serializer.save()
        except IntegrityError:
            raise DuplicateEventError()
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    @extend_schema(
        summary="List events",
        description="Paginated, filterable, newest-first list of events.",
        parameters=[
            OpenApiParameter("page", int, description="Page number (default 1)."),
            OpenApiParameter(
                "limit", int, description="Page size, max 100 (default 20)."
            ),
            OpenApiParameter(
                "event_type",
                str,
                description="Comma-separated list of event types to include.",
            ),
            OpenApiParameter(
                "date_from", str, description="ISO 8601 inclusive lower bound."
            ),
            OpenApiParameter(
                "date_to", str, description="ISO 8601 inclusive upper bound."
            ),
            OpenApiParameter(
                "search",
                str,
                description="Case-insensitive substring match on payload or user_id.",
            ),
        ],
        responses={200: EventSerializer},
    )
    def get(self, request):
        queryset = Event.objects.all()
        queryset = apply_event_filters(queryset, request.query_params)

        paginator = EventPagination()
        page = paginator.paginate_queryset(queryset, request, view=self)
        serializer = EventSerializer(page, many=True)
        return paginator.get_paginated_response(serializer.data)


class AnalyticsView(APIView):
    """GET /api/events/analytics -> aggregated counts + hourly timeline."""

    @extend_schema(
        summary="Event analytics",
        description="Aggregated counts and an hourly timeline for a trailing window.",
        parameters=[
            OpenApiParameter(
                "hours",
                int,
                description="Trailing window size in hours, 1-168 (default 24).",
            ),
        ],
        responses={200: AnalyticsSerializer},
    )
    def get(self, request):
        raw_hours = request.query_params.get("hours", "24")
        try:
            hours = int(raw_hours)
        except (TypeError, ValueError):
            raise ValidationError({"hours": ["hours must be an integer."]})
        if hours < 1 or hours > 168:
            raise ValidationError({"hours": ["hours must be between 1 and 168."]})

        data = get_analytics(hours)
        return Response(
            {
                "window_hours": data["window_hours"],
                "generated_at": data["generated_at"],
                "total_events": data["total_events"],
                "counts_by_type": data["counts_by_type"],
                "timeline": data["timeline"],
            }
        )


class HealthView(APIView):
    """GET /api/health -> checks DB connectivity."""

    @extend_schema(
        summary="Health check",
        description="Runs `SELECT 1` against the database.",
        responses={200: HealthSerializer, 503: HealthSerializer},
    )
    def get(self, request):
        try:
            with connection.cursor() as cursor:
                cursor.execute("SELECT 1")
                cursor.fetchone()
        except (OperationalError, InterfaceError) as exc:
            logger.error("Health check failed: %s", exc)
            return Response(
                {"status": "error"}, status=status.HTTP_503_SERVICE_UNAVAILABLE
            )
        return Response({"status": "ok"})
