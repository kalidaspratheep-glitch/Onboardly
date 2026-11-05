from rest_framework.decorators import api_view
from rest_framework.response import Response
from .models import Employee, Task
from .serializers import EmployeeSerializer, TaskSerializer
from django.shortcuts import get_object_or_404
from datetime import timedelta
from django.db import transaction, IntegrityError
from django.utils import timezone

from .models import Employee, Task, WorkflowTemplate, WorkflowAssignment
from .serializers import (
    EmployeeSerializer,
    TaskSerializer,
    WorkflowTemplateSerializer,
)

#employee views
@api_view(['GET', 'POST'])
def employee_list(request):
    if request.method == 'GET':
        employees = Employee.objects.all()
        serializer = EmployeeSerializer(employees, many=True)
        return Response(serializer.data)

    elif request.method == 'POST':
        serializer = EmployeeSerializer(data=request.data)

        if serializer.is_valid():
            serializer.save() #saves validated data in the db
            return Response(serializer.data, status=201) #201 means created

        return Response(serializer.errors, status=400) #400 means bad request

@api_view(['GET', 'PUT', 'PATCH', 'DELETE'])
def employee_detail(request, employee_id):
    employee = get_object_or_404(Employee, pk=employee_id)

    if request.method == 'GET':
        serializer = EmployeeSerializer(employee)
        return Response(serializer.data)

    elif request.method == 'DELETE':
        employee.delete()
        return Response(status = 204) #204 is no content

    elif request.method == 'PUT':
        serializer = EmployeeSerializer(employee, data=request.data)

    elif request.method == 'PATCH':
        serializer = EmployeeSerializer(
            employee,
            data=request.data,
            partial=True #only difference bw PUT AND PATCH
        )

    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data)

    return Response(serializer.errors, status=400)

#task views
@api_view(['GET', 'POST'])
def task_list(request):
    if request.method == 'GET':
        tasks = Task.objects.all()
        serializer = TaskSerializer(tasks, many=True)
        return Response(serializer.data)

    elif request.method == 'POST':
        serializer = TaskSerializer(data=request.data)

        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=201)

        return Response(serializer.errors, status=400)


@api_view(['GET', 'PUT', 'PATCH', 'DELETE'])
def task_detail(request, id):
    task = get_object_or_404(Task, pk=id)

    if request.method == 'GET':
        serializer = TaskSerializer(task)
        return Response(serializer.data)

    elif request.method == 'DELETE':
        task.delete()
        return Response(status=204)

    elif request.method == 'PUT':
        serializer = TaskSerializer(task, data=request.data)

    elif request.method == 'PATCH':
        serializer = TaskSerializer(task, data=request.data, partial=True)

    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data)

    return Response(serializer.errors, status=400)

#workflow views
@api_view(['GET'])
def workflow_list(request):
    workflows = WorkflowTemplate.objects.all()
    serializer = WorkflowTemplateSerializer(workflows, many=True)
    return Response(serializer.data)


@api_view(['POST'])
def apply_workflow(request, workflow_id):
    employee_id = request.data.get('employee_id')

    if not employee_id:
        return Response(
            {"error": "employee_id is required"},
            status=400
        )

    try:
        employee = Employee.objects.get(pk=employee_id)
    except (Employee.DoesNotExist, ValueError, TypeError):
        return Response(
            {"error": "Employee not found"},
            status=404
        )

    workflow = get_object_or_404(WorkflowTemplate, pk=workflow_id)

    start_date = timezone.localdate()
    created_tasks = []

    workflow_tasks = list(
        workflow.tasks.all().order_by('order', 'id')
    )

    if not workflow_tasks:
        return Response(
            {"error": "This workflow has no tasks."},
            status=400
        )

    try:
        with transaction.atomic():

            WorkflowAssignment.objects.create(
                employee=employee,
                workflow=workflow
            )

            for workflow_task in workflow_tasks:
                task = Task.objects.create(
                    title=workflow_task.title,
                    description=workflow_task.description,
                    status="Pending",
                    due_date=start_date + timedelta(
                        days=workflow_task.days_after_start
                    ),
                    employee=employee
                )
                created_tasks.append(task)

    except IntegrityError:
        return Response(
            {"error": "This workflow has already been assigned to this employee."},
            status=409
        )

    serializer = TaskSerializer(created_tasks, many=True)
    return Response(serializer.data, status=201)