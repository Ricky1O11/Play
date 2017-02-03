from django.conf.urls import url
from . import views
from rest_framework.urlpatterns import format_suffix_patterns
urlpatterns = [
    url(r'^$', views.index, name='index'),
    url(r'^read[bB]gg/$', views.readBgg, name='readBgg'), #read boardgamegeek
    url(r'^boardgames/$', views.BoardgamesList.as_view(), name='boardgames'), #boardgames list
    url(r'^boardgames/(?P<filter>[a-z]+)/$', views.BoardgamesListFiltered.as_view()), #single boardgame's details with filters managed in the views file
    url(r'^boardgames/(?P<pk>[0-9]+)/$', views.BoardgameDetail.as_view()), #single boardgame's details
    url(r'^users/$', views.UsersList.as_view(), name='users'), #users list
    url(r'^users/(?P<pk>[0-9]+)/$', views.UserDetail.as_view()), #user's detail
    url(r'^matches/$', views.MatchesList.as_view(), name='matches'), #matches list
    url(r'^matches/(?P<pk>[0-9]+)/$', views.MatchDetail.as_view(), name='matchDetail'), #match's detail
    url(r'^friends/$', views.FriendsList.as_view(), name='friends'), #friends list
    url(r'^friends/(?P<pk>[0-9]+)/$', views.FriendDetail.as_view(), name='friendDetail'), #friends' detail
    url(r'^favourites/$', views.FavouritesList.as_view(), name='favourites'), #favourites list
    url(r'^favourites/(?P<pk>[0-9]+)/$', views.FavouriteDetail.as_view(), name='favouriteDetail'), #favourites's detail
    url(r'^plays/$', views.PlaysList.as_view(), name='plays'), #plays detail
]

urlpatterns = format_suffix_patterns(urlpatterns)
