from rest_framework.negotiation import BaseContentNegotiation

# Custom negotiation to allow any response type (for PDF export)
class AllowAnyContentNegotiation(BaseContentNegotiation):
	def select_parser(self, request, parsers):
		return None
	def select_renderer(self, request, renderers, format_suffix):
		return (None, None)

from django.http import HttpResponse, Http404

from django.contrib.auth.decorators import login_required
from django.utils.decorators import method_decorator
from django.template.loader import render_to_string
from fairness.models import AnalysisReport
from xhtml2pdf import pisa


# Use a function-based view to avoid DRF's renderer system
def export_fairness_report_pdf(request, report_id):
	# Fetch report from MongoDB using AnalysisReport.get_report
	report = AnalysisReport.get_report(str(report_id))
	if not report:
		return HttpResponse('Report not found.', status=404)

	dataset_name = report.get('dataset_name', f'report_{report_id}')
	metrics = report.get('metrics', {})
	suggestions = report.get('suggestions', {})
	sensitive_attributes = report.get('sensitive_attributes', {})
	charts = report.get('charts', [])

	context = {
		'report': report,
		'metrics': metrics,
		'suggestions': suggestions,
		'sensitive_attributes': sensitive_attributes,
		'charts': charts,
	}

	html = render_to_string('reports/fairness_report_pdf.html', context)
	response = HttpResponse(content_type='application/pdf')
	filename = f'{dataset_name}_fairness_report.pdf'
	response['Content-Disposition'] = f'attachment; filename="{filename}"'
	pisa_status = pisa.CreatePDF(html, dest=response, encoding='utf-8')
	if pisa_status.err:
		return HttpResponse('PDF generation failed', status=500)
	return response
