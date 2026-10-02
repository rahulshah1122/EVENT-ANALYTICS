import os

# DEBUG must be off or Django skips our handler404 and shows debug pages
os.environ["DEBUG"] = "False"

import pytest
from django.core.management import call_command


@pytest.fixture(scope="session")
def django_db_setup(django_db_setup, django_db_blocker):
    # entrypoint.sh runs createcachetable for real deploys; do the same for
    # the test db since migrations alone won't create django_cache_table
    with django_db_blocker.unblock():
        call_command("createcachetable")
