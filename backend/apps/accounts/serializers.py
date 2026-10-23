from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from .models import User

class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    def validate(self, attrs):
        data = super().validate(attrs)
        data['user'] = {
            'id': self.user.id,
            'username': self.user.username,
            'email': self.user.email,
            'full_name': self.user.full_name,
            'role': self.user.role,
            'role_display': self.user.role_display,
            'avatar': self.user.avatar.url if self.user.avatar else None,
        }
        return data

class UserSerializer(serializers.ModelSerializer):
    full_name = serializers.ReadOnlyField()
    role_display = serializers.ReadOnlyField()

    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 'full_name',
                  'role', 'role_display', 'phone_number', 'avatar', 'address']
        read_only_fields = ['id', 'role_display']
