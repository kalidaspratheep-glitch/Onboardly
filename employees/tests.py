from datetime import timedelta

from django.utils import timezone
from rest_framework import status
from rest_framework.test import APITestCase

from .models import (
    Employee,
    Task,
    WorkflowTemplate,
    WorkflowTask,
    WorkflowAssignment,
)


class EmployeeAPITests(APITestCase):

    def test_create_employee(self):
        response = self.client.post(
            '/api/employees/',
            {
                'name': 'Rahul Sharma',
                'email': 'rahul@example.com',
                'department': 'Engineering',
            },
            format='json'
        )

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Employee.objects.count(), 1)


class TaskAPITests(APITestCase):

    def setUp(self):
        self.employee = Employee.objects.create(
            name='Rahul Sharma',
            email='rahul@example.com',
            department='Engineering'
        )

    def test_create_task(self):
        response = self.client.post(
            '/api/tasks/',
            {
                'title': 'Complete HR documentation',
                'description': 'Submit required documents',
                'status': 'Pending',
                'employee': self.employee.id,
            },
            format='json'
        )

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Task.objects.count(), 1)


class WorkflowAPITests(APITestCase):

    def setUp(self):
        self.employee = Employee.objects.create(
            name='Rahul Sharma',
            email='rahul@example.com',
            department='Engineering'
        )

        self.workflow = WorkflowTemplate.objects.create(
            name='Software Engineer Onboarding',
            description='Engineering onboarding process'
        )

        WorkflowTask.objects.create(
            template=self.workflow,
            title='Complete HR documentation',
            days_after_start=0,
            order=1
        )

        WorkflowTask.objects.create(
            template=self.workflow,
            title='Set up development environment',
            days_after_start=2,
            order=2
        )

    def apply_workflow(self):
        return self.client.post(
            f'/api/workflows/{self.workflow.id}/apply/',
            {'employee_id': self.employee.id},
            format='json'
        )

    def test_apply_workflow(self):
        response = self.apply_workflow()

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Task.objects.filter(employee=self.employee).count(), 2)
        self.assertEqual(
            WorkflowAssignment.objects.filter(employee=self.employee).count(),
            1
        )

    def test_duplicate_workflow_is_rejected(self):
        first_response = self.apply_workflow()
        second_response = self.apply_workflow()

        self.assertEqual(first_response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(second_response.status_code, status.HTTP_409_CONFLICT)

        self.assertEqual(Task.objects.filter(employee=self.employee).count(), 2)

    def test_deleting_employee_cascades(self):
        self.apply_workflow()

        self.assertEqual(Task.objects.filter(employee=self.employee).count(), 2)
        self.assertEqual(
            WorkflowAssignment.objects.filter(employee=self.employee).count(),
            1
        )

        response = self.client.delete(
            f'/api/employees/{self.employee.id}/'
        )

        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)

        self.assertEqual(Task.objects.count(), 0)
        self.assertEqual(WorkflowAssignment.objects.count(), 0)

        # Reusable workflow definitions should remain.
        self.assertEqual(WorkflowTemplate.objects.count(), 1)
        self.assertEqual(WorkflowTask.objects.count(), 2)