# from rest_framework.negotiation import BaseContentNegotiation

# # Custom negotiation to allow any response type (for PDF export)
# class AllowAnyContentNegotiation(BaseContentNegotiation):
# 	def select_parser(self, request, parsers):
# 		return None
# 	def select_renderer(self, request, renderers, format_suffix):
# 		return (None, None)

# from django.http import HttpResponse, Http404

# from django.contrib.auth.decorators import login_required
# from django.utils.decorators import method_decorator
# from django.template.loader import render_to_string
# from fairness.models import AnalysisReport
# from xhtml2pdf import pisa


# # Use a function-based view to avoid DRF's renderer system
# def export_fairness_report_pdf(request, report_id):
# 	# Fetch report from MongoDB using AnalysisReport.get_report
# 	report = AnalysisReport.get_report(str(report_id))
# 	if not report:
# 		return HttpResponse('Report not found.', status=404)

# 	dataset_name = report.get('dataset_name', f'report_{report_id}')
# 	metrics = report.get('metrics', {})
# 	suggestions = report.get('suggestions', {})
# 	sensitive_attributes = report.get('sensitive_attributes', {})
# 	charts = report.get('charts', [])

# 	context = {
# 		'report': report,
# 		'metrics': metrics,
# 		'suggestions': suggestions,
# 		'sensitive_attributes': sensitive_attributes,
# 		'charts': charts,
# 	}

# 	html = render_to_string('reports/fairness_report_pdf.html', context)
# 	response = HttpResponse(content_type='application/pdf')
# 	filename = f'{dataset_name}_fairness_report.pdf'
# 	response['Content-Disposition'] = f'attachment; filename="{filename}"'
# 	pisa_status = pisa.CreatePDF(html, dest=response, encoding='utf-8')
# 	if pisa_status.err:
# 		return HttpResponse('PDF generation failed', status=500)
# 	return response
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

    import matplotlib.pyplot as plt
    import os
    from django.conf import settings
    import uuid

    dataset_name = report.get('dataset_name', f'report_{report_id}')
    metrics = report.get('metrics', {})
    suggestions = report.get('suggestions', {})
    bias_detected = report.get('bias_detected', [])
    overall_fairness_score = report.get('overall_fairness_score', None)

    # --- Generate charts ---
    chart_dir = os.path.join(settings.MEDIA_ROOT, 'report_charts')
    os.makedirs(chart_dir, exist_ok=True)
    chart_paths = {}

    # Bar chart for fairness metrics
    fairness_metrics = ['demographic_parity', 'equalized_odds', 'individual_fairness']
    for metric in fairness_metrics:
        if metric in metrics:
            values = metrics[metric]
            if isinstance(values, dict):
                # If values are simple (not nested dicts)
                if all(not isinstance(v, dict) for v in values.values()):
                    keys = list(values.keys())
                    vals = list(values.values())
                    # Only plot if there is at least one non-zero value
                    if keys and vals and any(v != 0 for v in vals):
                        plt.figure(figsize=(6,3))
                        plt.bar(keys, vals, color='skyblue')
                        plt.title(metric.replace('_', ' ').title())
                        plt.ylabel('Score')
                        chart_path = os.path.join(chart_dir, f'{metric}_{uuid.uuid4().hex}.png')
                        plt.tight_layout()
                        plt.savefig(chart_path)
                        plt.close()
                        chart_paths[metric] = f'file://{os.path.abspath(chart_path).replace(os.sep, "/")}'
                else:
                    # If values are nested dicts, plot each attribute separately
                    for attr, attr_values in values.items():
                        if isinstance(attr_values, dict):
                            keys = list(attr_values.keys())
                            vals = list(attr_values.values())
                            if keys and vals and any(v != 0 for v in vals):
                                plt.figure(figsize=(6,3))
                                plt.bar(keys, vals, color='skyblue')
                                plt.title(f"{metric.replace('_', ' ').title()} - {attr}")
                                plt.ylabel('Score')
                                chart_path = os.path.join(chart_dir, f'{metric}_{attr}_{uuid.uuid4().hex}.png')
                                plt.tight_layout()
                                plt.savefig(chart_path)
                                plt.close()
                                chart_paths[f"{metric}_{attr}"] = f'file://{os.path.abspath(chart_path).replace(os.sep, "/")}'

    # Pie chart for bias severity
    if bias_detected:
        labels = [b['attribute'] for b in bias_detected]
        sizes = [b['score'] for b in bias_detected]
        colors = ['red' if b['severity']=='high' else 'yellow' if b['severity']=='medium' else 'green' for b in bias_detected]
        # Only plot if there is at least one non-zero value
        if sizes and any(s != 0 for s in sizes):
            plt.figure(figsize=(4,4))
            plt.pie(sizes, labels=labels, colors=colors, autopct='%1.1f%%', startangle=140)
            plt.title('Bias Severity Distribution')
            chart_path = os.path.join(chart_dir, f'bias_severity_{uuid.uuid4().hex}.png')
            plt.tight_layout()
            plt.savefig(chart_path)
            plt.close()
            chart_paths['bias_severity'] = f'file://{os.path.abspath(chart_path).replace(os.sep, "/")}'

    # --- Metric definitions ---
    metric_definitions = {
        'accuracy': 'Percent of correct predictions.',
        'precision': 'Percent of positive predictions that are correct.',
        'recall': 'Percent of actual positives identified.',
        'f1_score': 'Balance of precision and recall.',
        'roc_auc': 'Ability to distinguish classes.',
        'demographic_parity': 'Measures if different groups are treated equally.',
        'equalized_odds': 'Measures if error rates are similar across groups.',
        'individual_fairness': 'Measures if similar individuals are treated similarly.'
    }

    # --- Summary section ---
    summary = ""
    if overall_fairness_score is not None:
        summary += f"Overall Fairness Score: {overall_fairness_score}/10. "
        if overall_fairness_score >= 8:
            summary += "Your model is highly fair."
        elif overall_fairness_score >= 5:
            summary += "Your model has moderate fairness. Some bias detected."
        else:
            summary += "Your model has significant bias. Consider applying suggested improvements."
    if bias_detected:
        high_bias = [b['attribute'] for b in bias_detected if b['severity']=='high']
        if high_bias:
            summary += f" High bias detected for: {', '.join(high_bias)}."

    context = {
        'report': report,
        'metrics': metrics,
        'suggestions': suggestions,
        'chart_paths': chart_paths,
        'metric_definitions': metric_definitions,
        'summary': summary,
    }

    html = render_to_string('reports/fairness_report_pdf.html', context)
    response = HttpResponse(content_type='application/pdf')
    filename = f'{dataset_name}_fairness_report.pdf'
    response['Content-Disposition'] = f'attachment; filename="{filename}"'
    pisa_status = pisa.CreatePDF(html, dest=response, encoding='utf-8')
    if pisa_status.err:
        return HttpResponse('PDF generation failed', status=500)
    return response