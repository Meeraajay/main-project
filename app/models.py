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
    email = models.EmailField()
    dob = models.DateField()
    address = models.TextField()
    certificate = models.FileField(upload_to='certificates/')
    marks = models.IntegerField(default=0)

    pref1 = models.CharField(max_length=50, choices=COURSE_CHOICES)
    pref2 = models.CharField(max_length=50, choices=COURSE_CHOICES)
    pref3 = models.CharField(max_length=50, choices=COURSE_CHOICES)