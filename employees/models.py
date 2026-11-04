from django.db import models

# Create your models here.
class Employee(models.Model):
    name = models.CharField(max_length=100)
    email = models.EmailField()
    department = models.CharField(max_length=100)

    def __str__(self):
        return self.name

class Task(models.Model):
    title = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    status = models.CharField(max_length=20, default='Pending')
    due_date = models.DateField(null=True, blank=True)
    employee = models.ForeignKey(
        Employee,
        on_delete=models.CASCADE,
        related_name='tasks'
    )

    def __str__(self):
        return self.title