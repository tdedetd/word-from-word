from django.db import models

class Levels(models.Model):
    id = models.AutoField(primary_key=True)
    word_id = models.IntegerField()
    word_count = models.IntegerField()

    class Meta:
        db_table = '"public"."levels"'
        managed = False
