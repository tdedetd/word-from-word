from django import template
from django.conf import settings

register = template.Library()

@register.simple_tag
def webpack_url(url):
    return settings.WEBPACK_HOST + url
