from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework_simplejwt.views import TokenObtainPairView
from .models import User
from .serializers import CustomTokenObtainPairSerializer, UserSerializer

class CustomTokenObtainPairView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer

class CurrentUserView(generics.RetrieveUpdateAPIView):
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        return self.request.user

class UserListCreateView(generics.ListCreateAPIView):
    queryset = User.objects.all().order_by('-id')
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]

class UserDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]

    def update(self, request, *args, **kwargs):
        instance = self.get_object()
        # Ràng buộc an toàn: Tài khoản ADMIN / SUPERADMIN không bao giờ được phép khóa
        if instance.role in ['ADMIN', 'SUPERADMIN']:
            if 'is_active' in request.data and not request.data['is_active']:
                return Response(
                    {"detail": "Tài khoản Quản trị viên (Admin) không bao giờ được phép khóa để bảo vệ an toàn hệ thống!"},
                    status=status.HTTP_400_BAD_REQUEST
                )
        return super().update(request, *args, **kwargs)

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        if instance.id == request.user.id:
            return Response(
                {"detail": "Không thể xóa tài khoản của chính bạn đang đăng nhập!"},
                status=status.HTTP_400_BAD_REQUEST
            )
        if instance.role in ['ADMIN', 'SUPERADMIN']:
            return Response(
                {"detail": "Không thể xóa tài khoản Quản trị viên hệ thống (Admin)!"},
                status=status.HTTP_400_BAD_REQUEST
            )
        return super().destroy(request, *args, **kwargs)
