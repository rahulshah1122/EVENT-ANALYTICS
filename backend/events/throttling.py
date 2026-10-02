from rest_framework.throttling import SimpleRateThrottle


class ClientIPRateThrottle(SimpleRateThrottle):
    """Rate limit per client IP.

    Rate comes from RATE_LIMIT_PER_MINUTE; NUM_PROXIES makes DRF read the
    real client IP from X-Forwarded-For behind Nginx.
    """

    scope = "client_ip"

    def get_cache_key(self, request, view):
        ident = self.get_ident(request)
        return self.cache_format % {"scope": self.scope, "ident": ident}
