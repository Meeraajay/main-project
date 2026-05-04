from django.db import models
from django.contrib.auth.models import User

from django.db import models
from django.contrib.auth.models import User

COURSE_CHOICES = [
    ("Computer Science", "Computer Science"),
    ("Mathematics", "Mathematics"),
    ("Statistics", "Statistics"),
    ("Business Studies", "Business Studies"),
    ("Malayalam", "Malayalam"),
]

class Student(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)

    name = models.CharField(max_length=100)

    # SUBJECT MARKS (optional)
    maths = models.IntegerField(null=True, blank=True)
    physics = models.IntegerField(null=True, blank=True)
    chemistry = models.IntegerField(null=True, blank=True)
    biology = models.IntegerField(null=True, blank=True)
    computer = models.IntegerField(null=True, blank=True)
    english = models.IntegerField(null=True, blank=True)
    commerce = models.IntegerField(null=True, blank=True)

    # AUTO TOTAL
    marks = models.IntegerField(default=0)

    pref1 = models.CharField(max_length=50, choices=COURSE_CHOICES)
    pref2 = models.CharField(max_length=50, choices=COURSE_CHOICES)
    pref3 = models.CharField(max_length=50, choices=COURSE_CHOICES)


    is_allocated = models.BooleanField(default=False)
    is_pending = models.BooleanField(default=False)
    allocated_course = models.CharField(max_length=50, null=True, blank=True)



    def __str__(self):
        return self.user.username