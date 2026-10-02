from collections import OrderedDict

from rest_framework.exceptions import ValidationError
from rest_framework.pagination import PageNumberPagination
from rest_framework.response import Response


class EventPagination(PageNumberPagination):
    page_size = 20
    max_page_size = 100
    page_size_query_param = "limit"
    page_query_param = "page"

    def get_page_size(self, request):
        raw_limit = request.query_params.get(self.page_size_query_param)
        if raw_limit is not None:
            try:
                limit = int(raw_limit)
            except (TypeError, ValueError):
                raise ValidationError({"limit": ["limit must be an integer."]})
            if limit < 1:
                raise ValidationError({"limit": ["limit must be at least 1."]})
            return min(limit, self.max_page_size)
        return self.page_size

    def paginate_queryset(self, queryset, request, view=None):
        raw_page = request.query_params.get(self.page_query_param)
        if raw_page is not None:
            try:
                if int(raw_page) < 1:
                    raise ValueError
            except (TypeError, ValueError):
                raise ValidationError({"page": ["page must be a positive integer."]})
        return super().paginate_queryset(queryset, request, view)

    def get_paginated_response(self, data):
        return Response(
            OrderedDict(
                [
                    ("count", self.page.paginator.count),
                    ("page", self.page.number),
                    ("limit", self.get_page_size(self.request)),
                    ("total_pages", self.page.paginator.num_pages),
                    ("next", self.get_next_link()),
                    ("previous", self.get_previous_link()),
                    ("results", data),
                ]
            )
        )
