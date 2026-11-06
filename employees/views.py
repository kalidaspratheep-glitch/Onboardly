from rest_framework.decorators import api_view
from rest_framework.response import Response
from .models import Employee, Task
from .serializers import EmployeeSerializer, TaskSerializer
from django.shortcuts import get_object_or_404
from datetime import timedelta
from django.db import transaction, IntegrityError
from django.utils import timezone

from .models import Employee, Task, WorkflowTemplate, WorkflowTask, WorkflowAssignment
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
@api_view(['GET', 'POST'])
def workflow_list(request):
    if request.method == 'GET':
        workflows = WorkflowTemplate.objects.all()
        serializer = WorkflowTemplateSerializer(workflows, many=True)
        return Response(serializer.data)

    elif request.method == 'POST':
        name = request.data.get('name', '')
        description = request.data.get('description', '')

        if not isinstance(name, str) or not name.strip():
            return Response(
                {"error": "Workflow name is required."},
                status=400
            )

        if not isinstance(description, str):
            return Response(
                {"error": "Workflow description must be text."},
                status=400
            )

        name = name.strip()

        description = description.strip()
        tasks = request.data.get('tasks', [])

        if not isinstance(tasks, list) or not tasks:
            return Response(
                {"error": "At least one task is required."},
                status=400
            )

        # Validate all tasks before saving anything.
        validated_tasks = []

        for index, task in enumerate(tasks):
            if not isinstance(task, dict):
                return Response(
                    {"error": f"Task {index + 1} is invalid."},
                    status=400
                )

            title = task.get('title', '')
            task_description = task.get('description', '')
            days_after_start = task.get('days_after_start', 0)

            if not isinstance(title, str) or not title.strip():
                return Response(
                    {"error": f"Task {index + 1} needs a title."},
                    status=400
                )

            if not isinstance(task_description, str):
                return Response(
                    {"error": f"Description for task {index + 1} is invalid."},
                    status=400
                )

            if (
                isinstance(days_after_start, bool)
                or not isinstance(days_after_start, int)
                or days_after_start < 0
            ):
                return Response(
                    {"error": f"Days after start for task {index + 1} must be a non-negative integer."},
                    status=400
                )

            validated_tasks.append({
                "title": title.strip(),
                "description": task_description.strip(),
                "days_after_start": days_after_start,
                "order": index,
            })

        # Create the template and its tasks together.
        with transaction.atomic():
            workflow = WorkflowTemplate.objects.create(
                name=name,
                description=description
            )

            for task_data in validated_tasks:
                WorkflowTask.objects.create(
                    template=workflow,
                    **task_data
                )

        serializer = WorkflowTemplateSerializer(workflow)
        return Response(serializer.data, status=201)


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