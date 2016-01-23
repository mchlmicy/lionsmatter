from django import template
import datetime
from django.contrib.humanize.templatetags.humanize import naturaltime

register = template.Library()

@register.filter
def simplifyTimestamp(date_time_obj):
    #PFormats to MMM DD, YYY at H:MM (am/pm)
    if type(date_time_obj) is datetime.datetime:
        return date_time_obj.strftime('%b %-d, %Y at %-I:%M %p').replace(" AM", "am").replace(" PM", "pm").replace("Apr", "April").replace("Mar", "March").replace("Jun", "June").replace("Jul", "July")
    else:
        return date_time_obj


@register.filter
def lineSplitTime(date_time_obj, line_num):
    #PFormats to MMM DD, YYY at H:MM (am/pm)
    if type(date_time_obj) is datetime.datetime:
        if line_num == 1:
            return date_time_obj.strftime('%b %d, %Y').replace("Apr", "April").replace("Mar", "March").replace("Jun", "June").replace("Jul", "July")
        elif line_num == 2:
            return date_time_obj.strftime('%-I:%M %p').replace(" AM", "am").replace(" PM", "pm")
        else:
            return date_time_obj
    else:
        return date_time_obj


@register.filter
def toNaturalTime(date_time_obj):
    #PFormats to MMM DD, YYY at H:MM (am/pm)
    if type(date_time_obj) is datetime.datetime:
        natural_date_time_obj = naturaltime(date_time_obj)
        natural_date_time_obj = natural_date_time_obj.split(',', 1)[0].replace(' ago','') # split at first comma
        natural_date_time_obj = natural_date_time_obj.replace('an','1').replace('second','sec').replace('secs','sec').replace('minute','min').replace('mins','min') # deal with minutes and seconds
        natural_date_time_obj = natural_date_time_obj.replace('hour','hr').replace('month','mo').replace('week','wk').replace('year','yr')
        return natural_date_time_obj
    else:
        return date_time_obj