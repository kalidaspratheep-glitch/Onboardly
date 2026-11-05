from django.db import models

# Create your models here.
class Employee(models.Model):
    name = models.CharField(max_length=100)
    email = models.EmailField(unique=True)
    department = models.CharField(max_length=100)

    def __str__(self):
        return self.name

class Task(models.Model):
    STATUS_CHOICES = [
        ('Pending', 'Pending'),
        ('In Progress', 'In Progress'),
        ('Completed', 'Completed'),
    ]

    title = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    status = models.CharField(
            max_length=20, 
            choices=STATUS_CHOICES,
            default='Pending'
        )
    due_date = models.DateField(null=True, blank=True)
    employee = models.ForeignKey(
        Employee,
        on_delete=models.CASCADE,
        related_name='tasks'
    )

    def __str__(self):
        return self.title

class WorkflowTemplate(models.Model):
    name = models.CharField(max_length=200)
    description = models.TextField(blank=True)

    def __str__(self):
        return self.name

class WorkflowAssignment(models.Model):
    employee = models.ForeignKey(
        Employee,
        on_delete=models.CASCADE,
        related_name='workflow_assignments'
    )
    workflow = models.ForeignKey(
        WorkflowTemplate,
        on_delete=models.CASCADE,
        related_name='assignments'
    )
    assigned_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        constraints = [
            models.UniqueConstraint( #makes this unique so that an employee cannot be assigned the same workflow multiple times
                fields=['employee', 'workflow'],
                name='unique_employee_workflow'
            )
        ]

    def __str__(self):
        return f"{self.workflow.name} - {self.employee.name}"

class WorkflowTask(models.Model):
    template = models.ForeignKey(
        WorkflowTemplate,
        on_delete=models.CASCADE,
        related_name='tasks'
    )
    title = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    days_after_start = models.PositiveIntegerField(default=0)
    order = models.PositiveIntegerField(default=0)

    def __str__(self):
        return self.title