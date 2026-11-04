from rest_framework.decorators import api_view
from rest_framework.response import Response
from .models import Employee, Task
from .serializers import EmployeeSerializer, TaskSerializer
from django.shortcuts import get_object_or_404

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