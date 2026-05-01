from django.db import models

# Create your models here.
from django.db import models

class Student(models.Model):
    name = models.CharField(max_length=100)
    mark = models.IntegerField()
    course = models.CharField(max_length=100)

    def __str__(self):
        return self.name