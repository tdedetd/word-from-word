from django.db import models
from django.contrib.auth.models import AbstractUser


class User(AbstractUser):
    rating = models.FloatField(default=0)
    is_verified = models.BooleanField(default=False)

    class Meta:
        db_table = '"public"."auth_user"'
        managed = False


class Levels(models.Model):
    id = models.AutoField(primary_key=True)
    word_id = models.IntegerField()
    word_count = models.IntegerField()

    class Meta:
        db_table = '"public"."levels"'
        managed = False


class EmailToken(models.Model):
    from datetime import datetime, timedelta
    from django.conf import settings
    
    id = models.AutoField(primary_key=True)
    user_id = models.IntegerField()
    token = models.CharField(max_length=64)
    expires = models.DateTimeField(default=datetime.now() + timedelta(hours=settings.EMAIL_VERIFY_EXPIRATION_INTERVAL))
    email = models.CharField(max_length=254)

    class Meta:
        db_table = '"public"."email_tokens"'
        managed = False
