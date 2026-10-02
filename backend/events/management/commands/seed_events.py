import random
import uuid
from datetime import timedelta

from django.core.management.base import BaseCommand
from django.utils import timezone

from events.models import Event

EVENT_TYPES = [
    "user.login",
    "user.logout",
    "page.view",
    "button.click",
    "purchase.completed",
    "cart.updated",
    "signup.completed",
    "error.raised",
]


class Command(BaseCommand):
    help = "Seed the database with randomized Event records for local development/demo purposes."

    def add_arguments(self, parser):
        parser.add_argument(
            "--count", type=int, default=500, help="Number of events to create (default: 500)."
        )
        parser.add_argument(
            "--hours", type=int, default=48, help="Spread events over the last N hours (default: 48)."
        )

    def handle(self, *args, **options):
        count = options["count"]
        hours = options["hours"]
        now = timezone.now()

        events = []
        for _ in range(count):
            offset_seconds = random.randint(0, hours * 3600)
            ts = now - timedelta(seconds=offset_seconds)
            events.append(
                Event(
                    id=uuid.uuid4(),
                    user_id=f"user_{random.randint(1, 50)}",
                    event_type=random.choice(EVENT_TYPES),
                    payload={
                        "source": random.choice(["web", "mobile", "api"]),
                        "value": random.randint(0, 1000),
                    },
                    timestamp=ts,
                )
            )

        Event.objects.bulk_create(events)
        self.stdout.write(self.style.SUCCESS(f"Seeded {count} events over the last {hours} hours."))
