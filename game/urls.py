from django.conf.urls import url

from . import views

urlpatterns = [
    url(r'^auth/login/$', views.login, name='login'),
    url(r'^auth/logout/$', views.logout, name='logout'),
    url(r'^auth/signup/$', views.signup, name='signup'),
    url(r'^auth/register/$', views.register, name='register'),
    url(r'^auth/register/checklogin/(?P<login>.+)/$', views.checklogin, name='checklogin'),
    url(r'^auth/create_captcha/$', views.create_captcha, name='create_captcha'),
    url(r'^auth/update_captcha/$', views.update_captcha, name='update_captcha'),
    url(r'^auth/captcha_image/$', views.captcha_image, name='captcha_image'),
    # url(r'^auth/email/send_verify_token/$', views.send_verification_email),
    # url(r'^auth/email/verify_email/$', views.verify_email, name='verify_email'),
    url(r'^get_xp_info/$', views.get_xp_info),
    url(r'^get_levels/$', views.get_levels),
    url(r'^game/$', views.levels, { 'isCanonical': False }, name='levels'),
    url(r'^game/guest/$', views.levels, { 'isCanonical': True }, name='levels_guest'),
    url(r'^game/random_level/$', views.redirect_to_random_level, name='random_level'),
    url(r'^game/(?P<level_id>\d+)/$', views.game, name='game'),
    url(r'^game/(?P<level_id>\d+)/submit_word/$', views.submit_word),
    url(r'^profile(?P<user_id>\d+)/$', views.profile, name='profile'),
    url(r'^stats/$', views.stats, name='stats'),
    url(r'^stats/get_personal_stats/$', views.get_personal_stats),
    url(r'^stats/get_popular_words/$', views.get_popular_words),
    url(r'^news/$', views.news, name='news'),
    url(r'^$', views.home, name='home'),
]
