import django.utils.timezone
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("configvault", "0005_alter_game_api_target"),
    ]

    operations = [
        migrations.AddField(
            model_name="game",
            name="created_at",
            field=models.DateTimeField(auto_now_add=True, default=django.utils.timezone.now),
            preserve_default=False,
        ),
        migrations.AddField(
            model_name="game",
            name="updated_at",
            field=models.DateTimeField(auto_now=True),
        ),
    ]
