import json
from django.http import HttpResponse
#from django.views.decorators.csrf import csrf_exempt
from .models import *
from django.shortcuts import get_object_or_404
from .serializers import *
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
#from django.db.models import F, Q

def index(request):
    return HttpResponse("Home")

# Retrieve data from json representation of boardgamegeek database
def readBgg():
    in_file = open("server/bgg_1_20.json", "r")
    text = in_file.read()

    data = json.loads(text)
    in_file.close()
    try:
        for i in data:
            game = data[i]
            gamedb = Boardgames()
            gamedb.average = game["average"]
            gamedb.bggid = i
            gamedb.description = game["description"]
            gamedb.img = game["image"]
            gamedb.title = game["name"]
            gamedb.usersrated = game["usersrated"]
            gamedb.maxplayers = game["maxplayers"]
            gamedb.maxplaytime = game["maxplaytime"]
            gamedb.minage = game["minage"]
            gamedb.minplayers = game["minplayers"]
            gamedb.minplaytime = game["minplaytime"]
            gamedb.playingtime = game["playingtime"]
            gamedb.yearpublished = game["yearpublished"]
            gamedb.thumbnail = game["thumbnail"]
            gamedb.save()

        return HttpResponse("Correct reading")
    except:
        return HttpResponse("Wrong reading")

# Boardgame list
class BoardgamesList(APIView):
    def get(self, request):
        boardgames = Boardgames.objects.all()
        boardgamesSerializers = BoardgamesSerializers(boardgames, many=True, context={'request': request})
        return Response(boardgamesSerializers.data)

# @csrf_exempt
# @api_view(['POST'])

# Boardgame list with filters. Allowed: "favourites", "recents"
class BoardgamesListFiltered(APIView):
    def get(self, request, filter):
        if (filter == 'favourites' or filter == 'favourites'):
            user_id = self.request.query_params.get('user_id', None)
            if (user_id is not None):
                boardgames = Boardgames.objects.filter(favourites__user=user_id)
                boardgamesSerializers = BoardgamesSerializers(boardgames, many=True, context={'request': request})
                return Response(boardgamesSerializers.data)
            else:
                return Response("error: insert user_id")

        elif (filter == 'recents'):
            user_id = self.request.query_params.get('user_id', None)
            if (user_id is not None):
                boardgames = Boardgames.objects.filter(matches__plays__user=user_id).distinct()
                boardgames.order_by('matches__match_time')
                boardgamesSerializers = BoardgamesSerializers(boardgames, many=True, context={'request': request})
                return Response(boardgamesSerializers.data)
            else:
                return Response("error: insert user_id")



# Single boardgame details
class BoardgameDetail(APIView):

    def get(self, request, pk):
        boardgame = Boardgames.objects.filter(pk=pk).distinct()
        boardgamesSerializers = BoardgamesSerializers(boardgame, many=True, context={'request': request})

        return Response(boardgamesSerializers.data)

# User list
class UsersList(APIView):
    def get(self, request):
        users = Users.objects.all()
        usersSerializers = UsersSerializers(users, many=True, context={'request': request})
        return Response(usersSerializers.data)

    def post(self, request):
        users = UsersSerializers(data=request.data, context={'request': request})
        if users.is_valid():
            users.save()
            return Response(users.data, status=status.HTTP_201_CREATED)
        return Response(users.errors, status=status.HTTP_400_BAD_REQUEST)

# Single user details
class UserDetail(APIView):
    def get(self, request, pk):
        user = get_object_or_404(Users, pk=pk)
        userSerializers = UsersSerializers(user, context={'request': request})
        return Response(userSerializers.data)

    def get_object(self, pk):
        try:
            return Users.objects.get(pk=pk)
        except Users.DoesNotExist:
            return 0

    def put(self, request, pk):
        user = self.get_object(pk)
        userSerializers = UsersSerializers(user, data=request.data, context={'request': request})
        if userSerializers.is_valid():
            userSerializers.save()
            return Response(userSerializers.data)
        return Response(userSerializers.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, pk):
        user = self.get_object(pk)
        user.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

# Match list
class MatchesList(APIView):
    def get(self, request):
        user_id = self.request.query_params.get('user_id', None)
        if (user_id is not None):
            matchwithuser = Matches.objects.filter(plays__user=user_id)
            matchesSerializers = MatchesSerializers(matchwithuser, many=True, context={'request': request})
            return Response(matchesSerializers.data)
        else:
            return Response("error: insert user_id")

    def post(self, request):
        match = MatchesSerializers(data=request.data)
        if match.is_valid():
            match.save()
            return Response(match.data, status=status.HTTP_201_CREATED)
        return Response(match.errors, status=status.HTTP_400_BAD_REQUEST)

# Match detail
class MatchDetail(APIView):
    def get(self, request, pk):
        user_id = self.request.query_params.get('user_id', None)
        if (user_id is not None):
            matchwithuser = Matches.objects.filter(plays__user=user_id, pk=pk).distinct()
            matchesSerializers = MatchesSerializers(matchwithuser, many=True, context={'request': request})
            return Response(matchesSerializers.data)

    def get_object(self, pk):
        try:
            return Matches.objects.get(pk=pk)
        except Matches.DoesNotExist:
            return 0

    def put(self, request, pk):
        match = self.get_object(pk)
        matchSerializers = MatchesSerializers(match, data=request.data, context={'request': request})
        if matchSerializers.is_valid():
            matchSerializers.save()
            return Response(matchSerializers.data)
        return Response(matchSerializers.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, pk):
        match = self.get_object(pk)
        match.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

# Friends list
class FriendsList(APIView):
    def get(self, request):
        friends = Friends.objects.all()
        friendsSerializers = FriendsSerializers(friends, many=True, context={'request': request})
        return Response(friendsSerializers.data)

    def post(self, request):
        friends = FriendsSerializers(data=request.data, context={'request': request})
        if friends.is_valid():
            friends.save()
            return Response(friends.data, status=status.HTTP_201_CREATED)
        return Response(friends.errors, status=status.HTTP_400_BAD_REQUEST)

#Friend Detail
class FriendDetail(APIView):
    def get(self, request, pk):
        friend = get_object_or_404(Friends, pk=pk)
        friendSerializers = FriendsSerializers(friend, context={'request': request})
        return Response(friendSerializers.data)

    def get_object(self, pk):
        try:
            return Friends.objects.get(pk=pk)
        except Friends.DoesNotExist:
            return 0

    def put(self, request, pk):
        friend = self.get_object(pk)
        friendSerializers = FriendsSerializers(friend, data=request.data, context={'request': request})
        if friendSerializers.is_valid():
            friendSerializers.save()
            return Response(friendSerializers.data)
        return Response(friendSerializers.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, pk):
        friend = self.get_object(pk)
        friend.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

# Favourites list
class FavouritesList(APIView):
    def get(self, request):
        favourites = Favourites.objects.all()
        favouritesSerializers = FavouritesSerializers(favourites, many=True, context={'request': request})
        return Response(favouritesSerializers.data)

    def post(self, request):
        favourites = FavouritesSerializers(data=request.data, context={'request': request})
        if favourites.is_valid():
            favourites.save()
            return Response(favourites.data, status=status.HTTP_201_CREATED)
        return Response(favourites.errors, status=status.HTTP_400_BAD_REQUEST)

#Friend Detail
class FavouriteDetail(APIView):
    def get(self, request, pk):
        favourite = get_object_or_404(Favourites, pk=pk)
        favouriteSerializers = FavouritesSerializers(favourite, context={'request': request})
        return Response(favouriteSerializers.data)

    def get_object(self, pk):
        try:
            return Favourites.objects.get(pk=pk)
        except Favourites.DoesNotExist:
            return 0

    def put(self, request, pk):
        favourite = self.get_object(pk)
        favouriteSerializers = FavouritesSerializers(favourite, data=request.data, context={'request': request})
        if favouriteSerializers.is_valid():
            favouriteSerializers.save()
            return Response(favouriteSerializers.data)
        return Response(favouriteSerializers.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, pk):
        favourite = self.get_object(pk)
        favourite.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

# Plays list
class PlaysList(APIView):
    def get(self, request):
        plays = Plays.objects.all()
        playsSerializers = PlaysSerializers(plays, many=True, context={'request': request})
        return Response(playsSerializers.data)

    def post(self, request):
        plays = PlaysSerializers(data=request.data, many=True, context={'request': request})
        if plays.is_valid():
            plays.save()
            return Response(plays.data, status=status.HTTP_201_CREATED)
        return Response(plays.errors, status=status.HTTP_400_BAD_REQUEST)
