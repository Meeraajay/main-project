from django.urls import path,include
from . import views
urlpatterns = [
    path('', views.index),
    path('studentdash/', views.studentdash),
    path('admindash/', views.admindash),
    path('apply/', views.apply, name='apply'),
    path('allocate/', views.allocate_students),
    path('set-config/', views.set_config, name='set_config'),
]
