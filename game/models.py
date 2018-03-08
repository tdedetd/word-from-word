from django.db import models
from django.contrib.auth.models import AbstractUser


class User(AbstractUser):
    rating = models.FloatField()

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
