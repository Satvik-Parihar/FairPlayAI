
from rest_framework.negotiation import BaseContentNegotiation
import base64
from io import BytesIO
from PIL import Image
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
from django.utils import timezone

from django.views.decorators.csrf import csrf_exempt
import matplotlib
matplotlib.use('Agg')  # <-- Add this line before importing pyplot
import matplotlib.pyplot as plt
import os
from django.conf import settings
import uuid
from django.utils.safestring import mark_safe

# Use a function-based view to avoid DRF's renderer system
@csrf_exempt
def export_fairness_report_pdf(request, report_id):
    frontend_viz_path = None
    if request.method == "POST" and request.content_type.startswith("application/json"):
        import json
        body = json.loads(request.body.decode("utf-8"))
        viz_image = body.get("viz_image")
        if viz_image and viz_image.startswith("data:image/png;base64,"):
            img_data = viz_image.split(",")[1]
            img_bytes = base64.b64decode(img_data)
            img = Image.open(BytesIO(img_bytes))
            viz_filename = f"frontend_viz_{uuid.uuid4().hex}.png"
            viz_path = os.path.join(chart_dir, viz_filename)
            img.save(viz_path)
            frontend_viz_path = f'file://{os.path.abspath(viz_path).replace(os.sep, "/")}'
    # Fetch report from MongoDB using AnalysisReport.get_report
    report = AnalysisReport.get_report(str(report_id))
    if not report:
        return HttpResponse('Report not found.', status=404)

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
    chart_captions = {}  # Initialize chart_captions here
    for metric in chart_paths:
        chart_captions[metric] = metric.replace('_', ' ').title()
    for metric in fairness_metrics:
        if metric in metrics:
            values = metrics[metric]
            if isinstance(values, dict):
                # If values are simple (not nested dicts)
                if all(not isinstance(v, dict) for v in values.values()):
                    keys = []
                    vals = []
                    for k, v in values.items():
                        if isinstance(v, (int, float)) and v is not None:
                            keys.append(k)
                            vals.append(v)
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
                        chart_paths[metric] = os.path.abspath(chart_path)
                        chart_captions[metric] = metric.replace('_', ' ').title()
                else:
                    # If values are nested dicts, plot each attribute separately
                    for attr, attr_values in values.items():
                        if isinstance(attr_values, dict):
                            keys =[]
                            vals = []
                            for k, v in attr_values.items():
                                if isinstance(v, (int, float)) and v is not None:
                                    keys.append(k)
                                    vals.append(v)
                            if keys and vals and any(v != 0 for v in vals):
                                plt.figure(figsize=(6,3))
                                plt.bar(keys, vals, color='skyblue')
                                plt.title(f"{metric.replace('_', ' ').title()} - {attr}")
                                plt.ylabel('Score')
                                chart_path = os.path.join(chart_dir, f'{metric}_{attr}_{uuid.uuid4().hex}.png')
                                plt.tight_layout()
                                plt.savefig(chart_path)
                                plt.close()
                                chart_paths[f"{metric}_{attr}"] = os.path.abspath(chart_path)
                                chart_captions[f"{metric}_{attr}"] = f"{metric.replace('_', ' ').title()} - {attr}"

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
            chart_paths['bias_severity'] = os.path.abspath(chart_path)
            chart_captions['bias_severity'] = "Bias Severity Distribution"

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

    # --- Prepare metrics table data for PDF ---
    metrics_table_data = []
    for metric_name, metric_value in metrics.items():
        if isinstance(metric_value, dict):
            # Flatten nested dicts for top-level metrics
            for sub_name, sub_value in metric_value.items():
                if isinstance(sub_value, dict):
                    for inner_key, inner_value in sub_value.items():
                        metrics_table_data.append((f"{metric_name} - {sub_name} - {inner_key}", inner_value))
                else:
                    metrics_table_data.append((f"{metric_name} - {sub_name}", sub_value))
        else:
            metrics_table_data.append((metric_name, metric_value))

    # --- Theme for table styling ---
    theme = {
        'header_bg': '#eaf0fa',
        'header_fg': '#1d3557',
        'row_bg1': '#f7fafd',
        'row_bg2': '#fff',
        'header_font': 'Helvetica-Bold',
        'body_font': 'Helvetica',
        'font_size': 10,
        'grid_color': '#bbb',
        'label_col_width': 120,
        'value_col_width': 180,
    }

    # --- Calibration section ---
    calibration = report.get('calibration', {})
    calibration_table_html = ""
    if calibration:
        # Render calibration as a vector-based HTML table
        calibration_table_html = render_calibration_table(calibration)

    # --- Generate the metrics table using the formatter ---
    context = {
        'frontend_viz_path': frontend_viz_path,
        'report': report,
        'metrics': metrics,
        'suggestions': suggestions,
        'chart_paths': chart_paths,
        'chart_captions': chart_captions,
        'metric_definitions': metric_definitions,
        'summary': summary,
        'metrics_table_data': metrics_table_data,  # <-- Pass the raw table data
        'theme': theme,
        'calibration_table_html': mark_safe(calibration_table_html),
         'created_at': timezone.now(), 
    }

    html = render_to_string('reports/fairness_report_pdf.html', context)
    html = preprocess_html_images(html)
    response = HttpResponse(content_type='application/pdf')
    filename = f'{dataset_name}_fairness_report.pdf'
    response['Content-Disposition'] = f'attachment; filename="{filename}"'
    pisa_status = pisa.CreatePDF(html, dest=response, encoding='utf-8')
    if pisa_status.err:
        return HttpResponse('PDF generation failed', status=500)
    return response

def convert_file_url_to_path(src):
    # Remove 'file://' if present, always return absolute path
    if src.startswith('file://'):
        abs_path = src.replace('file://', '')
        return abs_path
    return src

def preprocess_html_images(html):
    import re
    def replacer(match):
        src = match.group(1)
        local_path = convert_file_url_to_path(src)
        return f'<img src="{local_path}"'
    # Replace file:// URLs and ensure all <img src="..."> are absolute paths
    html = re.sub(r'<img src="file://([^"]+)"', replacer, html)
    return html

def render_calibration_table(calibration):
    """
    Render calibration dict as a vector-based HTML table with readable font and high-contrast styling.
    """
    # Example calibration dict:
    # {'bin': [0.0, 0.1, ...], 'accuracy': [0.8, ...], 'count': [100, ...]}
    headers = list(calibration.keys())
    rows = zip(*[calibration[h] for h in headers])
    table_html = """
    <table style="
        width: 100%;
        border-collapse: collapse;
        margin-top: 18px;
        margin-bottom: 28px;
        font-size: 12pt;
        table-layout: fixed;
        background: #fff;
        box-shadow: 0 2px 8px #eee;
    ">
      <caption style="
        caption-side: top;
        font-weight: bold;
        font-size: 1.1em;
        color: #2a4d8f;
        margin-bottom: 8px;
        letter-spacing: 0.5px;
      ">Calibration Table</caption>
      <thead>
        <tr>
    """
    for h in headers:
        table_html += f'<th style="background:#eaf0fa; color:#1d3557; border:1px solid #222; padding:8px;">{h.title()}</th>'
    table_html += "</tr></thead><tbody>"
    for row in rows:
        table_html += "<tr>"
        for cell in row:
            table_html += f'<td style="border:1px solid #222; padding:8px; color:#222; background:#f7fafd; text-align:center;">{cell}</td>'
        table_html += "</tr>"
    table_html += "</tbody></table>"
    return table_html