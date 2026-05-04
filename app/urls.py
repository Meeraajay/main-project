from django.urls import path,include
from . import views 

urlpatterns = [
    path('',views.login_view),
    path('register/',views.register, name='register'),         
    path('apply/',views.apply, name='apply'),   
    path('studentdash/', views.studentdash),
    path('admindash/', views.admindash),
    path('apply/', views.apply, name='apply'),
    path('allocate/', views.allocate_students),
    path('set-config/', views.set_config, name='set_config'),
    path('pending-candidates/', views.pending_candidates),
    path('admin-decision/', views.admin_decision),
    path('set-phase/', views.set_phase),
    path("system-state/", views.system_state),
]
