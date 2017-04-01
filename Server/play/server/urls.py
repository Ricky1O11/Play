from django.conf.urls import url
from . import views
from rest_framework.urlpatterns import format_suffix_patterns
from rest_framework_jwt.views import obtain_jwt_token
urlpatterns = [
    url(r'^$', views.index, name='index'),
    url(r'^read[bB]gg/$', views.readBgg, name='readBgg'), #read boardgamegeek
    url(r'^boardgames/$', views.BoardgamesList.as_view(), name='boardgames'), #boardgames list
    url(r'^boardgames/(?P<filter>[a-z]+)/$', views.BoardgamesListFiltered.as_view()), #single boardgame's details with filters managed in the views file
    url(r'^boardgames/(?P<pk>[0-9]+)/$', views.BoardgameDetail.as_view()), #single boardgame's details
    url(r'^users/$', views.UsersList.as_view(), name='users'), #users list
    url(r'^users/(?P<pk>[0-9]+)/$', views.UserDetail.as_view()), #user's detail
    url(r'^profiles/(?P<pk>[0-9]+)/$', views.ProfileDetail.as_view()), #user's detail
    url(r'^matches/$', views.MatchesList.as_view(), name='matches'), #matches list
    url(r'^matches/(?P<pk>[0-9]+)/$', views.MatchDetail.as_view(), name='matchDetail'), #match's detail
    url(r'^friends/$', views.FriendsList.as_view(), name='friends'), #friends list
    url(r'^friends/(?P<pk>[0-9]+)/$', views.FriendDetail.as_view(), name='friendDetail'), #friends' detail
    url(r'^favourites/$', views.FavouritesList.as_view(), name='favourites'), #favourites list
    url(r'^favourites/(?P<pk>[0-9]+)/$', views.FavouriteDetail.as_view(), name='favouriteDetail'), #favourites detail
    url(r'^plays/$', views.PlaysList.as_view(), name='plays'), #plays detail
    url(r'^templates/$', views.TemplatesList.as_view(), name='templates'), #templates list
    url(r'^templates/(?P<boardgame>[0-9]+)/$', views.TemplateDetail.as_view(), name='templateDetail'), #templates detail
    url(r'^dictionary/$', views.DictionaryList.as_view(), name='dictionary'), #dictionary
    url(r'^dictionary/(?P<pk>[0-9]+)/$', views.DictionaryDetail.as_view(), name='dictionaryDetail'), #dictionary detail
    url(r'^detailedpoints/$', views.DetailedPointsList.as_view(), name='detailed_points'), #detailed points list
    url(r'^detailedpoints/(?P<pk>[0-9]+)/$', views.DetailedPointDetail.as_view(), name='detailed_pointsDetail'), #detailed point detail
    url(r'^scoringfields/$', views.ScoringFieldsList.as_view(), name='scoring_fields'), #scoring fields list
    url(r'^scoringfields/(?P<pk>[0-9]+)/$', views.ScoringFieldDetail.as_view(), name='scoring_fieldDetail'), #scoring field detail
    url(r'^register/', views.UserRegister.as_view(), name='user_register'),
    url(r'^auth/token/', obtain_jwt_token)
]

urlpatterns = format_suffix_patterns(urlpatterns)
