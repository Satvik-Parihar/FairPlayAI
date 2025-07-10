# from rest_framework import serializers
# from .models import AnalysisResult

# class AnalysisResultSerializer(serializers.ModelSerializer):
#     class Meta:
#         model = AnalysisResult
#         fields = '__all__'
from rest_framework import serializers
from .models import AnalysisReportRecord

class ReportSerializer(serializers.ModelSerializer):
    class Meta:
        model = AnalysisReportRecord
        fields = '__all__'