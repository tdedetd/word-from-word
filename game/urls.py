from django.conf.urls import url

from . import views

urlpatterns = [
    url(r'^auth/login/$', views.login, name='login'),
    url(r'^auth/logout/$', views.logout, name='logout'),
    url(r'^auth/signup/$', views.signup, name='signup'),
    url(r'^auth/register/$', views.register, name='register'),
    url(r'^auth/register/checklogin/(?P<login>.+)/$', views.checklogin, name='checklogin'),
    url(r'^get_xp_info/$', views.get_xp_info),
    url(r'^get_levels/$', views.get_levels),
    url(r'^game/$', views.levels, name='game'),
    url(r'^game/(?P<level_id>\d+)/$', views.game),
    url(r'^game/(?P<level_id>\d+)/submit_word/$', views.submit_word),
    url(r'^profile(?P<user_id>\d+)/$', views.profile, name='profile'),
    url(r'^stats/$', views.stats, name='stats'),
    url(r'^stats/get_personal_stats/$', views.get_personal_stats),
    url(r'^$', views.home, name='home'),
]
