"""Query-param filtering for the event list.

A plain function rather than a django-filter FilterSet so bad input can
return a proper 400 with a useful message.
"""
from __future__ import annotations

from datetime import datetime

from django.db.models import Q, TextField
from django.db.models.functions import Cast
from django.utils import timezone
from django.utils.dateparse import parse_datetime
from rest_framework.exceptions import ValidationError


def _parse_date_boundary(raw: str, field_name: str) -> datetime:
    value = parse_datetime(raw)
    if value is None:
        # bare dates like "2024-01-01" are fine too
        try:
            value = datetime.fromisoformat(raw)
        except ValueError:
            value = None
    if value is None:
        raise ValidationError({field_name: [f"'{raw}' is not a valid ISO 8601 date/datetime."]})
    if timezone.is_naive(value):
        value = timezone.make_aware(value, timezone.utc)
    return value


def apply_event_filters(queryset, params):
    event_type = params.get("event_type")
    if event_type:
        types = [t.strip() for t in event_type.split(",") if t.strip()]
        if types:
            queryset = queryset.filter(event_type__in=types)

    date_from_raw = params.get("date_from")
    date_to_raw = params.get("date_to")
    date_from = _parse_date_boundary(date_from_raw, "date_from") if date_from_raw else None
    date_to = _parse_date_boundary(date_to_raw, "date_to") if date_to_raw else None

    if date_from and date_to and date_from > date_to:
        raise ValidationError(
            {"date_from": ["date_from must not be after date_to."]}
        )

    if date_from:
        queryset = queryset.filter(timestamp__gte=date_from)
    if date_to:
        queryset = queryset.filter(timestamp__lte=date_to)

    search = params.get("search")
    if search:
        # accept cleaned forms too: "User 31" -> "user_31", "Page View" -> "page.view"
        normalized = search.strip().lower()
        terms = {normalized}
        for sep in ("_", ".", "-", ":"):
            terms.add(normalized.replace(" ", sep))

        q = Q()
        for term in terms:
            q |= (
                Q(payload_text__icontains=term)
                | Q(user_id__icontains=term)
                | Q(event_type__icontains=term)
            )
        queryset = queryset.annotate(payload_text=Cast("payload", TextField())).filter(q)

    return queryset
