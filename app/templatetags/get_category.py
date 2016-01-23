from django import template
from app.models import Category

register = template.Library()

@register.simple_tag
def get_category(cat_id):
    try:
        return Category.objects.get(id=cat_id).title
    except Category.DoesNotExist:
        return 'Unknown'