from django.db import models
from django.contrib.auth.models import AbstractUser


class User(AbstractUser):
    rating = models.FloatField(default=0)
    is_verified = models.BooleanField(default=False)
    word_submits = models.IntegerField(default=0)

    class Meta:
        db_table = '"public"."auth_user"'
        managed = False


class Level(models.Model):
    id = models.AutoField(primary_key=True)
    word_id = models.IntegerField()
    word_count = models.IntegerField()

    class Meta:
        db_table = '"public"."levels"'
        managed = False


class Captcha(models.Model):
    id = models.CharField(max_length=40, primary_key=True)
    answer = models.CharField(max_length=128)
    expires = models.DateTimeField()

    class Meta:
        db_table = '"public"."captcha"'
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


class Updates(models.Model):
    id = models.AutoField(primary_key=True)
    message = models.TextField()
    created_on = models.DateTimeField()

    class Meta:
        db_table = '"public"."updates"'
        managed = False


class LevelOrderType(models.Model):
    id = models.AutoField(primary_key=True)
    name = models.CharField(max_length=32)
    nio = models.IntegerField()

    class Meta:
        db_table = '"public"."level_order_types"'
        managed = False


class LevelOrderDir(models.Model):
    id = models.AutoField(primary_key=True)
    name = models.CharField(max_length=32)

    class Meta:
        db_table = '"public"."level_order_dirs"'
        managed = False
