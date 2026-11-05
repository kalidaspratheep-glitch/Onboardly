from django.contrib import admin
from .models import Employee, Task, WorkflowTemplate, WorkflowTask

admin.site.register(Employee)
admin.site.register(Task)
admin.site.register(WorkflowTemplate)
admin.site.register(WorkflowTask)