import pytest
from django.core.cache import cache


@pytest.fixture(autouse=True)
def _clear_cache():
    # throttle counters live in the cache — clear it so tests don't leak
    cache.clear()
    yield
    cache.clear()
