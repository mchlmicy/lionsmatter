from django import forms
from django.forms import ModelForm, ModelChoiceField
from app.models import Post, Category, Timeline, SiteBug, Department, Status
import urllib
import urlparse


class NewPost(ModelForm):
    post = forms.CharField(widget=forms.Textarea(), min_length=6, error_messages={'required': 'Your post must contain at least 6 characters.','min_length': 'Your post must contain at least 6 characters.'})
    category = forms.ModelChoiceField(widget=forms.HiddenInput(), queryset=Category.objects.all(), required=True, error_messages={'required': 'Please select a department.', 'invalid_choice': 'Please select a valid department.'})
    image = forms.ImageField(required=False, error_messages={'invalid_image': 'The file you have selected is not an image'})
    vine = forms.URLField(widget=forms.HiddenInput(), required=False)
    user_displayname = forms.CharField(widget=forms.HiddenInput(), required=True, error_messages={'required': 'Please select the name you would like to assosicate this post with.'})

    def clean_vine(self):
        vine = self.cleaned_data['vine']
        if vine:
            query = urlparse.urlparse(vine)
            if query.hostname == 'vine.co':
                if query.path.split('/')[1] == 'v' and query.path.split('/')[2]:
                    if urllib.urlopen('https://vine.co/api/timelines/posts/s/'+query.path.split('/')[2]).getcode() == 200:
                        return 'https://vine.co/v/'+query.path.split('/')[2]
                    else:
                        raise forms.ValidationError(u'This Vine is invalid. Please try again.')
                else:
                    raise forms.ValidationError(u'This Vine is invalid. Please try again.')
            else:
                raise forms.ValidationError(u'This Vine is invalid. Please try again.')

    def clean(self):
        form_data = self.cleaned_data
        if form_data['image'] and form_data['vine']:
            del form_data['image']
        return form_data

    class Meta:
        model = Post
        fields = ['post','category','image','vine','user_displayname']


class NewBug(ModelForm):
    title = forms.CharField(widget=forms.TextInput(), required=True, error_messages={'required': 'Please enter a title'})
    description = forms.CharField(widget=forms.Textarea(), required=True, error_messages={'required': 'Please enter a description'})
    page = forms.ChoiceField(choices=(('', ''), ('Home', 'Home'), ('Feeds', 'Feeds'), ('Messages', 'Messages'), ('Notifications', 'Notifications'), ('Profile', 'Profile'), ('Settings', 'Settings'), ('Sign In', 'Sign In'), ('Sign Up', 'Sign Up'), ('Topics', 'Topics')), required=True, error_messages={'required': 'Please select an applicable page.'}, initial={'section': 'section'})
    login_status = forms.CharField(widget=forms.Select(choices=(('null', ''), ('logged in', 'I was logged in'), ('logged out', 'I was logged out'), ('both', 'I\'ve encountered this problem while logged in and logged out'))), required=False)
    device = forms.CharField(widget=forms.Select(choices=(('null', ''), ('mobile device', 'Mobile Device/Phone'), ('tablet', 'Tablet'), ('desktop/laptop', 'Desktop/Laptop'), ('multiple', 'I\'ve encountered this problem on multiple devices.'))), required=False)
    screenshot = forms.ImageField(required=False)

    class Meta:
        model = SiteBug
        fields = ['title','description','page','login_status','device','screenshot']


class NewTailResponse(forms.Form):
    name = forms.CharField(widget=forms.TextInput(), required=True, error_messages={'required': 'Please enter your name'})
    department = ModelChoiceField(queryset=Department.objects.all(), empty_label=None, error_messages={'required': 'Please select a department.'})
    position = forms.CharField(widget=forms.TextInput(), required=True, error_messages={'required': 'Please enter your position of job title.'})
    response = forms.CharField(widget=forms.Textarea(), required=True, error_messages={'required': 'Please enter a response'})


class UpdatePostStatus(forms.Form):
    status_code = ModelChoiceField(queryset=Status.objects.exclude(code='Gold'), empty_label=None)
    status_recipient_dept = ModelChoiceField(queryset=Department.objects.all(), empty_label=None, required=False)
    status_recipient_email = forms.EmailField(required=False)
    flag = forms.CharField(widget=forms.Textarea(), required=False)


class UpdateTimeline(ModelForm):
    TYPE_CHOICES = (
        ('break', 'Break (front-end problem)'),
        ('bug', 'Bug (code-end problem)'),
        ('todo', 'Needs Coding'),
        ('suggestion', 'Suggestion'),
        ('html', 'HTML'),
        ('css', 'CSS'),
        ('js', 'JavaScript'),
        ('python', 'Python'),
        ('tail', 'Tail'),
    )

    type = forms.ChoiceField(choices=TYPE_CHOICES)
    title = forms.CharField(widget=forms.Textarea(), min_length=2, required=False)
    description = forms.CharField(widget=forms.Textarea(), min_length=5)
    happens_when = forms.CharField(widget=forms.Textarea(), required=False)

    class Meta:
        model = Timeline
        fields = ['type','title','description','happens_when']