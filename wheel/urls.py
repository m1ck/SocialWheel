from django.conf.urls.defaults import *

urlpatterns = patterns('',
    (r"^$", "wheel.main.views.main", {'template_name': 'wheel.html'}),
    (r"^network/$", "wheel.main.views.network", {'template_name': 'facebook_network.html'}),
    (r'^getfriends/', "wheel.main.views.getfriends"),
    (r'^numfriends/', "wheel.main.views.numfriends"),
    (r'^test/(?P<id>\w+)/$', "wheel.main.views.test"),
    (r'^getpic/(?P<site>\w+)/$', "wheel.main.util.getpic"),
    (r'^getcontacts/(?P<site>\w+)/$', "wheel.main.util.getcontacts"),
    (r'^service/(?P<site>\w+)/$', "wheel.main.views.showwheel"),
    (r'^(?P<site>\w+)/$', "wheel.main.views.showwheel"),
)
