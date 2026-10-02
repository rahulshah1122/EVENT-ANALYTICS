"""Every API error goes out as {"error": {code, message, details}} —
no stack traces to clients."""
import logging

from django.db.utils import InterfaceError, OperationalError
from rest_framework import exceptions as drf_exceptions
from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import exception_handler as drf_exception_handler

logger = logging.getLogger(__name__)


class DuplicateEventError(drf_exceptions.APIException):
    status_code = status.HTTP_409_CONFLICT
    default_detail = "An event with this id already exists."
    default_code = "duplicate_event"


class ServiceUnavailableError(drf_exceptions.APIException):
    status_code = status.HTTP_503_SERVICE_UNAVAILABLE
    default_detail = "Service temporarily unavailable."
    default_code = "service_unavailable"


_CODE_BY_STATUS = {
    400: "validation_error",
    404: "not_found",
    409: "duplicate_event",
    429: "rate_limited",
    503: "service_unavailable",
}


def _error_response(status_code: int, code: str, message: str, details=None) -> Response:
    payload = {"error": {"code": code, "message": message, "details": details or {}}}
    response = Response(payload, status=status_code)
    return response


def custom_exception_handler(exc, context):
    # DB is down/unreachable -> 503, don't surface a 500
    if isinstance(exc, (OperationalError, InterfaceError)):
        logger.error("Database unavailable: %s", exc)
        return _error_response(
            status.HTTP_503_SERVICE_UNAVAILABLE,
            "service_unavailable",
            "The service is temporarily unavailable. Please try again shortly.",
        )

    response = drf_exception_handler(exc, context)

    if response is None:
        # anything we didn't expect -> plain 500
        logger.exception("Unhandled server error: %s", exc)
        return _error_response(
            status.HTTP_500_INTERNAL_SERVER_ERROR,
            "server_error",
            "An unexpected error occurred.",
        )

    code = _CODE_BY_STATUS.get(response.status_code, "server_error")
    details = {}
    retry_after = None

    if isinstance(exc, drf_exceptions.Throttled):
        message = "Request was throttled. Too many requests."
        if exc.wait is not None:
            retry_after = int(exc.wait) + 1
            details = {"retry_after": retry_after}
    elif isinstance(response.data, dict) and "detail" in response.data:
        message = str(response.data["detail"])
    else:
        details = response.data if isinstance(response.data, (dict, list)) else {}
        message = "Request could not be processed."
        # field errors like {"date_from": ["..."]} — surface the first one as
        # the message so the UI isn't stuck with a generic 400
        if isinstance(details, dict) and details:
            field, errs = next(iter(details.items()))
            first = errs[0] if isinstance(errs, (list, tuple)) and errs else errs
            message = str(first) if field == "non_field_errors" else f"{field}: {first}"

    # APIException subclasses like DuplicateEventError carry their own code
    custom_code = getattr(exc, "default_code", None)
    if custom_code in {"duplicate_event", "service_unavailable"}:
        code = custom_code

    final_response = _error_response(response.status_code, code, message, details)
    if retry_after is not None:
        final_response["Retry-After"] = str(retry_after)
    return final_response
