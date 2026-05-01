from django.urls import path,include
from . import views
urlpatterns = [
    path('', views.index),
    path('studentdash/', views.studentdash),
    path('admindash/', views.admindash),
]