from django.core.management.base import BaseCommand

from apps.core.models import Game

# Django management command to trigger a sync/update of a `Game` record
# backed by a Steam AppID. This command expects a single positional
# argument `steam_appid` and will attempt to find the corresponding
# `Game` instance and call `.save()` so any model logic (signals, overrides,
# or syncing utilities) runs.
class Command(BaseCommand):
    help = "Sync a Game with Steam API by steam_appid."

    def add_arguments(self, parser):
        # Register a single required positional integer argument for the
        # Steam AppID of the game to sync.
        parser.add_argument("steam_appid", type=int)

    def handle(self, *args, **options):
        # Extract the appid from parsed options
        appid = options["steam_appid"]
        try:
            # Try to find the Game instance by its steam_appid. If found,
            # call `save()` which is expected to perform the actual sync
            # (for example, via model methods or post-save signals).
            game = Game.objects.get(steam_appid=appid)
            game.save()

            # Write a success message to stdout so callers can see the result
            self.stdout.write(self.style.SUCCESS(f"Successfully synced {appid}"))
        except Game.DoesNotExist:
            # Inform the user that no Game exists with the given AppID.
            self.stderr.write(self.style.ERROR("Game not found."))
        except Exception as exc:
            # Catch-all: surface any unexpected exception message to stderr.
            self.stderr.write(self.style.ERROR(str(exc)))
