from rest_framework import serializers
from .models import Employee, Task, WorkflowTemplate, WorkflowTask

class EmployeeSerializer(serializers.ModelSerializer):
    class Meta:
        model = Employee
        fields = '__all__'

class WorkflowTaskSerializer(serializers.ModelSerializer):
    class Meta:
        model = WorkflowTask
        fields = '__all__'


class WorkflowTemplateSerializer(serializers.ModelSerializer):
    tasks = WorkflowTaskSerializer(many=True, read_only=True)

    class Meta:
        model = WorkflowTemplate
        fields = ["id", "name", "description", "tasks"] #__all__ works fine here

class TaskSerializer(serializers.ModelSerializer):
    class Meta:
        model = Task
        fields = '__all__'