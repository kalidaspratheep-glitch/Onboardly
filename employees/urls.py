from django.urls import path
from . import views

urlpatterns = [
    #employee endpoints
    path('employees/', views.employee_list, name='employee-list'),
    path('employees/<int:employee_id>/', views.employee_detail, name='employee-detail'),
    
    #task endpoints
    path('tasks/', views.task_list, name='task-list'),
    path('tasks/<int:id>/', views.task_detail, name='task-detail'),

    #workflow endpoints
    path('workflows/', views.workflow_list, name='workflow-list'),
    path('workflows/<int:workflow_id>/apply/', views.apply_workflow, name='apply-workflow'),
]