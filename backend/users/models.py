
from django.db import models

class AppUser(models.Model):
    name = models.CharField(max_length=100)
    email = models.EmailField()
    password = models.CharField(max_length=128)  # hashed later
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.email
