# Django settings for mta project.

DEBUG = True
TEMPLATE_DEBUG = True
IS_PRODUCTION = False

ADMINS = (
    # ('Patrick Kelly', 'kellyp1@tcnj.edu'),
    # ('Michael Young', 'youngm6@tcnj.edu'),
)

MANAGERS = ADMINS

DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.sqlite3', # Add 'postgresql_psycopg2', 'postgresql', 'mysql', 'sqlite3' or 'oracle'.
        'NAME': 'lionsmatter.db',                      # Or path to database file if using sqlite3.
        'USER': '',                      # Not used with sqlite3.
        'PASSWORD': '',                  # Not used with sqlite3.
        'HOST': '',                      # Set to empty string for localhost. Not used with sqlite3.
        'PORT': '',                      # Set to empty string for default. Not used with sqlite3.
    }
}

# Local time zone for this installation. Choices can be found here:
# http://en.wikipedia.org/wiki/List_of_tz_zones_by_name
# although not all choices may be available on all operating systems.
# On Unix systems, a value of None will cause Django to use the same
# timezone as the operating system.
# If running in a Windows environment this must be set to the same as your
# system time zone.
TIME_ZONE = 'America/New_York'

USE_TZ = True

# Language code for this installation. All choices can be found here:
# http://www.i18nguy.com/unicode/language-identifiers.html
LANGUAGE_CODE = 'en-us'

SITE_ID = 1

# If you set this to False, Django will make some optimizations so as not
# to load the internationalization machinery.
USE_I18N = True

# If you set this to False, Django will not format dates, numbers and
# calendars according to the current locale
USE_L10N = True

# Absolute filesystem path to the directory that will hold user-uploaded files.
# Example: "/home/media/media.lawrence.com/media/"
MEDIA_ROOT = ''

# URL that handles the media served from MEDIA_ROOT. Make sure to use a
# trailing slash.
# Examples: "http://media.lawrence.com/media/", "http://example.com/media/"
MEDIA_URL = '/media/'

# Absolute path to the directory static files should be collected to.
# Don't put anything in this directory yourself; store your static files
# in apps' "static/" subdirectories and in STATICFILES_DIRS.
# Example: "/home/media/media.lawrence.com/static/"
STATIC_ROOT = ''

# URL prefix for static files.
# Example: "http://media.lawrence.com/static/"
STATIC_URL = '/static/'

ALLOWED_HOSTS = ['lionsmatter.com','www.lionsmatter.com','tail.lionsmatter.com']

# Additional locations of static files
STATICFILES_DIRS = (
    '/home/lionsmat/django/lionsmatter/app/static/',
    # Put strings here, like "/home/html/static" or "C:/www/django/static".
    # Always use forward slashes, even on Windows.
    # Don't forget to use absolute paths, not relative paths.
)

# List of finder classes that know how to find static files in
# various locations.
STATICFILES_FINDERS = (
    'django.contrib.staticfiles.finders.FileSystemFinder',
    'django.contrib.staticfiles.finders.AppDirectoriesFinder',
#    'django.contrib.staticfiles.finders.DefaultStorageFinder',
)

# Make this unique, and don't share it with anybody.
SECRET_KEY = '%p%na(8876bm^*lu82+j2@72ti0aulz)5+3o2(whpq)qg9(s%d'

# Set login url
LOGIN_URL = '/'

# List of callables that know how to import templates from various sources.
TEMPLATE_LOADERS = (
    'django.template.loaders.filesystem.Loader',
    'django.template.loaders.app_directories.Loader',
)

TEMPLATE_CONTEXT_PROCESSORS = (
    'django.contrib.auth.context_processors.auth',
    'django.contrib.messages.context_processors.messages',
    'django.core.context_processors.debug',
    'django.core.context_processors.i18n',
    'django.core.context_processors.media',
    'app.processor.inbox',
    'app.processor.UserSettings',
    'app.processor.UserNotifications',
    'django.core.context_processors.request'
    )

MIDDLEWARE_CLASSES = (
    'django.contrib.sessions.middleware.SessionMiddleware',
    'subdomains.middleware.SubdomainURLRoutingMiddleware',
    'django.middleware.locale.LocaleMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django_cas.middleware.CASMiddleware',
    'pagination.middleware.PaginationMiddleware',
    'django.middleware.doc.XViewMiddleware',
)

AUTHENTICATION_BACKENDS = (
    'django.contrib.auth.backends.ModelBackend',
    'django_cas.backends.CASBackend',
)

AUTH_PROFILE_MODULE = 'app.UserProfile'

# All CAS-related settings
CAS_SERVER_URL = 'https://cas1.tcnj.edu/cas/'
CAS_AUTO_CREATE_USERS = True
CAS_REDIRECT_URL = '/login/success/'
CAS_IGNORE_REFERER = True
CAS_Version = '1'

ROOT_URLCONF = 'lionsmatter.urls'

SUBDOMAIN_URLCONFS = {
    None: 'lionsmatter.urls',
    'www': 'lionsmatter.urls',
    'tail': 'lionsmatter.tail-urls',
}


from django.conf import global_settings
FILE_UPLOAD_HANDLERS = ('uploadProgressHandler.UploadProgressCachedHandler', ) + \
    global_settings.FILE_UPLOAD_HANDLERS


CACHES = {
    'default': {
        'BACKEND': 'django.core.cache.backends.memcached.MemcachedCache',
        'LOCATION': 'upload',
    }
}

TEMPLATE_DIRS = (
    # Put strings here, like "/home/html/django_templates" or "C:/www/django/templates".
    # Always use forward slashes, even on Windows.
    # Don't forget to use absolute paths, not relative paths.
)


ABSOLUTE_URL_OVERRIDES = {
    'auth.user': lambda u: "/%s" % u.username,
}

INSTALLED_APPS = (
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.sites',
    'django.contrib.admin',
    'registration',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'django.contrib.humanize',
    'django.contrib.comments',
    'threaded_messages',
    'haystack',
    'pagination',
    'jsonfield',
    'imagekit',
    'uni_form',
    'threaded_messages',
    'google_analytics',
    'subdomains',
    'endless_pagination',
    'widget_tweaks',
    'voting',
    'app',
)

ACCOUNT_ACTIVATION_DAYS = 7

# Email settings
DEFAULT_FROM_EMAIL = 'LionsMatter <activation@lionsmatter.com>'
EMAIL_BACKEND = 'sendmail.EmailBackend'
EMAIL_HOST = 'localhost'
EMAIL_PORT = '465'
EMAIL_HOST_USER = 'activation@lionsmatter.com'
EMAIL_HOST_PASSWORD = ''
EMAIL_USE_TLS = False

# haystack settings
HAYSTACK_CONNECTIONS = {
    'default': {
        'ENGINE': 'haystack.backends.simple_backend.SimpleEngine',
        'EXCLUDED_INDEXES': ['threaded_messages.search_indexes.ThreadIndex'],
    },
}
HAYSTACK_SIGNAL_PROCESSOR = 'haystack.signals.RealtimeSignalProcessor'


# A sample logging configuration. The only tangible logging
# performed by this configuration is to send an email to
# the site admins on every HTTP 500 error.
# See http://docs.djangoproject.com/en/dev/topics/logging for
# more details on how to customize your logging configuration.
LOGGING = {
    'version': 1,
    'disable_existing_loggers': False,
    'handlers': {
        'mail_admins': {
            'level': 'ERROR',
            'class': 'django.utils.log.AdminEmailHandler'
        }
    },
    'loggers': {
        'django.request': {
            'handlers': ['mail_admins'],
            'level': 'ERROR',
            'propagate': True,
        },
    }
}
