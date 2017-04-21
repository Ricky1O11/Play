import json
from django.http import HttpResponse
#from django.views.decorators.csrf import csrf_exempt
from .models import *
from django.shortcuts import get_object_or_404
from .serializers import *
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.core.paginator import Paginator, EmptyPage, PageNotAnInteger
from rest_framework.pagination import LimitOffsetPagination
from os import listdir
from os.path import isfile, join
import sys

from rest_framework.permissions import AllowAny,IsAuthenticated
#from django.db.models import F, Q

# import the logging library
import logging

# Get an instance of a logger
logger = logging.getLogger(__name__)

def index(request):
    return HttpResponse("Home")

# Retrieve data from json representation of boardgamegeek database
def readBgg(self):
    in_files = [f for f in listdir("/home/playapi/Play/Server/play/jsons/trial") if isfile(join("/home/playapi/Play/Server/play/jsons/trial", f))]
    expansionsDict = {}
    for in_file in in_files:
        #in_file = "bgg_1_500.json"
        file = open(join("/home/playapi/Play/Server/play/jsons/trial", in_file), "r")
        text = file.read()

        data = json.loads(text)
        file.close()
        #try:
        boundaries = [int(s) for s in in_file.replace(".","_").split("_") if s.isdigit()]

        for i in range(int(boundaries[0]),int(boundaries[1])):
            if(str(i) in data):

                game = data[str(i)]
                gamedb = Boardgames()
                if("rpgartist" in game or 
                    "rpgdesigner" in game or 
                    "rpgpublisher" in game or 
                    "videogamedeveloper" in game or
                    "videogamepublisher" in game):
                    print "Not a boardgame: skipped"
                else:
                    if(Boardgames.objects.filter(bggid = i).count() == 0):
                        print "Boardgame id: " + str(i)
                        gamedb.bggid = i
                        if("average" in game):
                            if(game["average"] != "null"):
                                gamedb.average = game["average"]
                        if("description" in game):
                            gamedb.description = game["description"]
                        if("image" in game):
                            gamedb.img = game["image"]
                        if("name" in game):
                            gamedb.title = game["name"]
                        if("usersrated" in game):
                            gamedb.usersrated = game["usersrated"]
                        if("maxplayers" in game):
                            gamedb.maxplayers = game["maxplayers"]
                        if("maxplaytime" in game):
                            gamedb.maxplaytime = game["maxplaytime"]
                        if("age" in game):
                            gamedb.minage = game["age"]
                        if("minplayers" in game):
                            gamedb.minplayers = game["minplayers"]
                        if("minplaytime" in game):
                            gamedb.minplaytime = game["minplaytime"]
                        if("playingtime" in game):
                            gamedb.playingtime = game["playingtime"]
                        if("yearpublished" in game):
                            gamedb.yearpublished = game["yearpublished"]
                        if("thumbnail" in game):
                            gamedb.thumbnail = game["thumbnail"]

                        if("boardgameexpansion" in game): #if the game has expansions
                            expansionsDict[i] = game["boardgameexpansion"]

                        #TODO: manage new expansions
                        gamedb.save()
                        
                        if("boardgamecategory" in game):
                            for cat in game["boardgamecategory"]:
                                categorydb = Category()
                                category = Category.objects.filter(name = cat)
                                if(category.count() == 0):
                                    categorydb.name = cat
                                    categorydb.save()
                                    currentCategory = categorydb
                                else:
                                    currentCategory = category[0]
                                belongsdb = BelongsToTheCategory()
                                belongsdb.category =  currentCategory
                                belongsdb.boardgame = gamedb
                                belongsdb.save()

                        if("boardgamedesigner" in game):
                            for des in game["boardgamedesigner"]:
                                designerdb = Designer()
                                designer = Designer.objects.filter(name = des)
                                if(designer.count() == 0):
                                    designerdb.name = des
                                    designerdb.save()
                                    currentDesigner = designerdb
                                else:
                                    currentDesigner = designer[0]
                                designedbydb = IsDesignedBy()
                                designedbydb.designer =  currentDesigner
                                designedbydb.boardgame = gamedb
                                designedbydb.save()

                        if("boardgamepublisher" in game):
                            for pub in game["boardgamepublisher"]:
                                publisherdb = Publisher()
                                publisher = Publisher.objects.filter(name = pub)
                                if(publisher.count() == 0):
                                    publisherdb.name = pub
                                    publisherdb.save()
                                    currentPublisher = publisherdb
                                else:
                                    currentPublisher = publisher[0]
                                publishedbydb = IsPublishedBy()
                                publishedbydb.publisher=  currentPublisher
                                publishedbydb.boardgame = gamedb
                                publishedbydb.save()
        
    for game_id in expansionsDict:
        print game_id
        boardgame_record = Boardgames.objects.filter(bggid = game_id)
        for expansion_id in expansionsDict[game_id]:
            expansion = Boardgames.objects.filter(bggid = int(expansion_id))
            if(expansion.count() == 1):
                expansionofdb = IsExpansionOf()
                expansionofdb.boardgame1=  expansion[0]
                expansionofdb.boardgame2 = boardgame_record[0]
                expansionofdb.save()

        #return HttpResponse("Pro")
        #except:
        #    return HttpResponse("Seghe")
# Boardgame list
class BoardgamesList(APIView):
    permission_classes = (AllowAny,)
    def get(self, request):
        order_by = self.request.query_params.get('order_by', None)
        search_key = self.request.query_params.get('search_key', None)

        paginator = LimitOffsetPagination()
        
        if(search_key != None and search_key != ""):
            print search_key
            boardgames = Boardgames.objects.filter(title__icontains = search_key).order_by(order_by)
        else:
            boardgames = Boardgames.objects.all().order_by(order_by)
        result_page = paginator.paginate_queryset(boardgames, request)
        boardgamesSerializers = BoardgamesSerializers(result_page, many=True, context={'request': request})
        return Response(boardgamesSerializers.data)

# @csrf_exempt
# @api_view(['POST'])

# Boardgame list with filters. Allowed: "favourites", "recents"
class BoardgamesListFiltered(APIView):
    permission_classes = (AllowAny,)
    def get(self, request, filter):
        user_id = self.request.query_params.get('user_id', None)
        if (filter == 'favourites' or filter == 'favourites'):
            boardgames = Boardgames.objects.filter(favourites__user=user_id)
            boardgamesSerializers = BoardgamesSerializers(boardgames, many=True, context={'request': request})
            return Response(boardgamesSerializers.data)

        elif (filter == 'recents'):
            boardgames = Boardgames.objects.filter(matches__plays__user=user_id).distinct()
            boardgames.order_by('matches__match_time')
            boardgamesSerializers = BoardgamesSerializers(boardgames, many=True, context={'request': request})
            return Response(boardgamesSerializers.data)

# Single boardgame details
class BoardgameDetail(APIView):

    def get(self, request, pk):
        boardgame = Boardgames.objects.filter(pk=pk).distinct()
        boardgamesSerializers = BoardgamesSerializers(boardgame, many=True, context={'request': request})

        return Response(boardgamesSerializers.data)


# User Register
class UserRegister(APIView):
    permission_classes = (AllowAny,)
    def post(self, request):
        user = UserRegisterSerializers(data=request.data, context={'request': request})
        if user.is_valid():
            user.create(request.data)
            return Response(user.data, status=status.HTTP_201_CREATED)
        return Response(user.errors, status=status.HTTP_400_BAD_REQUEST)

# User list
class UsersList(APIView):
    def get(self, request):
        users = User.objects.all()
        usersSerializers = UsersSerializers(users, many=True, context={'request': request})
        return Response(usersSerializers.data)

# Single user details
class UserDetail(APIView):
    def get(self, request, pk):
        user = get_object_or_404(User, pk=pk)
        userSerializers = UsersSerializers(user, context={'request': request})
        return Response(userSerializers.data)

    def get_object(self, pk):
        try:
            return User.objects.get(pk=pk)
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
        auth_user = request.user
        if(auth_user == pk):
            user = self.get_object(pk)
            user.delete()
            return Response(status=status.HTTP_204_NO_CONTENT)

# Single profile details
class ProfileDetail(APIView):
    def get_object(self, pk):
        try:
            return Profile.objects.get(pk=pk)
        except Profile.DoesNotExist:
            return 0
            
    def put(self, request, pk):
        profile = self.get_object(pk)
        profileSerializers = ProfileSerializers(profile, data=request.data, context={'request': request})
        if profileSerializers.is_valid():
            profileSerializers.save()
            return Response(profileSerializers.data)
        return Response(profileSerializers.errors, status=status.HTTP_400_BAD_REQUEST)

# Match list
class MatchesList(APIView):
    def get(self, request):
        auth_user = self.request.user
        if (auth_user is not None):
            matchwithuser = Matches.objects.filter(plays__user=auth_user)
            matchesSerializers = MatchesSerializers(matchwithuser, many=True, context={'request': request})
            return Response(matchesSerializers.data)

    def post(self, request):
        match = MatchesSerializers(data=request.data, context={'request': request})
        if match.is_valid():
            match.save()
            return Response(match.data, status=status.HTTP_201_CREATED)
        return Response(match.errors, status=status.HTTP_400_BAD_REQUEST)

# Match detail
class MatchDetail(APIView):
    def get(self, request, pk):
        auth_user = self.request.user
        if (auth_user is not None):
            match = Matches.objects.filter(plays__user=auth_user, pk=pk)
            matchesSerializers = MatchesSerializers(match, many=True, context={'request': request})
            return Response(matchesSerializers.data)

    def get_object(self, pk):
        try:
            return Matches.objects.get(pk=pk)
        except Matches.DoesNotExist:
            return 0

    def put(self, request, pk):
        auth_user = self.request.user
        match = Matches.objects.filter(plays__user=auth_user, pk=pk)[0]
        matchSerializers = MatchesSerializers(match, data=request.data, context={'request': request})
        if matchSerializers.is_valid():
            matchSerializers.save()
            return Response(matchSerializers.data)
        return Response(matchSerializers.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, pk):
        auth_user = self.request.user
        match = Matches.objects.filter(plays__user=auth_user, pk=pk)
        match.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

# Friends list
class FriendsList(APIView):
    def get(self, request):
        auth_user = self.request.user
        friends = Friends.objects.filter(Q(user1=auth_user) | Q(user2=auth_user))
        friendsSerializers = FriendsSerializers(friends, many=True, context={'request': request})
        return Response(friendsSerializers.data)

    def post(self, request):
        friends = FriendsSerializers(data=request.data, many=True, context={'request': request})
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

    permission_classes = (AllowAny,)
    def get(self, request):
        user_id = self.request.query_params.get('user_id', None)
        favourites = Favourites.objects.filter(user = user_id)
        favouritesSerializers = FavouritesSerializers(favourites, many=True, context={'request': request})
        return Response(favouritesSerializers.data)

    def post(self, request):
        auth_user = request.user.pk
        favourite = {"user" : auth_user, "boardgame" : request.data["boardgame"]}
        favouritesSerializers = FavouritesSerializers(data=favourite, context={'request': request})
        if favouritesSerializers.is_valid():
            favouritesSerializers.save()
            return Response(favouritesSerializers.data, status=status.HTTP_201_CREATED)
        return Response(favouritesSerializers.errors, status=status.HTTP_400_BAD_REQUEST)

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
        auth_user = self.request.user
        favourite = Favourites.objects.filter(pk=pk, user=auth_user)
        favouriteSerializers = FavouritesSerializers(favourite, data=request.data, context={'request': request})
        if favouriteSerializers.is_valid():
            favouriteSerializers.save()
            return Response(favouriteSerializers.data)
        return Response(favouriteSerializers.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, pk):
        auth_user = self.request.user
        favourite = Favourites.objects.filter(pk=pk, user=auth_user)
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

# Template list
class TemplatesList(APIView):
    def get(self, request):
        boardgame_id = self.request.query_params.get('boardgame_id', None)
        if (boardgame_id is not None):
            template = Templates.objects.filter(boardgame=boardgame_id)
            templatesSerializers = TemplatesSerializers(template, many=True, context={'request': request})
            return Response(templatesSerializers.data)
        else:
            return Response("error: insert boardgame_id")

    def post(self, request):
        template = TemplatesSerializers(data=request.data, many=True, context={'request': request})
        if template.is_valid():
            template.save()
            return Response(template.data, status=status.HTTP_201_CREATED)
        return Response(template.errors, status=status.HTTP_400_BAD_REQUEST)

#Template Detail
class TemplateDetail(APIView):
    def get(self, request, pk):
        template = Templates.objects.filter(pk = pk)
        templatesSerializers = TemplatesSerializers(template, many=True, context={'request': request})
        return Response(templatesSerializers.data)

    def get_object(self, pk):
        try:
            return Templates.objects.get(pk=pk)
        except Templates.DoesNotExist:
            return 0
    
    def put(self, request, pk):
        template = self.get_object(pk)
        templatesSerializers = TemplatesSerializers(template, data=request.data, context={'request': request})
        if templatesSerializers.is_valid():
            templatesSerializers.save()
            return Response(templatesSerializers.data)
        return Response(templatesSerializers.errors, status=status.HTTP_400_BAD_REQUEST)
    
    def delete(self, request, pk):
        auth_user = self.request.user
        if(auth_user.is_staff):
            template = self.get_object(pk)
            template.delete()
            return Response(status=status.HTTP_204_NO_CONTENT)

# Word list
class DictionaryList(APIView):
    def get(self, request):
        dictionary = Dictionary.objects.all()
        dictionarySerializers = DictionarySerializers(dictionary, many=True, context={'request': request})
        return Response(dictionarySerializers.data)

    def post(self, request):
        dictionary = DictionarySerializers(data=request.data, many=True, context={'request': request})
        if dictionary.is_valid():
            dictionary.save()
            return Response(dictionary.data, status=status.HTTP_201_CREATED)
        return Response(dictionary.errors, status=status.HTTP_400_BAD_REQUEST)

#Word Detail
class DictionaryDetail(APIView):
    def get(self, request, pk):
        dictionary = Dictionary.objects.filter(pk = pk)
        dictionarySerializers = DictionarySerializers(dictionary, many=True, context={'request': request})
        return Response(dictionarySerializers.data)

    def get_object(self, pk):
        try:
            return Dictionary.objects.get(pk=pk)
        except Dictionary.DoesNotExist:
            return 0
    
    def put(self, request, pk):
        dictionary = self.get_object(pk)
        dictionarySerializers = DictionarySerializers(dictionary, data=request.data, context={'request': request})
        if dictionarySerializers.is_valid():
            dictionarySerializers.save()
            return Response(dictionarySerializers.data)
        return Response(dictionarySerializers.errors, status=status.HTTP_400_BAD_REQUEST)
    
    def delete(self, request, pk):
        auth_user = self.request.user
        if(auth_user.is_staff):
            dictionary = self.get_object(pk)
            dictionary.delete()
            return Response(status=status.HTTP_204_NO_CONTENT)

class PlayedExpansionsList(APIView):
    def get(self, request):
        playedExpansion = PlayedExpansions.objects.all()
        playedExpansionsSerializers = PlayedExpansionsSerializers(playedExpansion, many=True, context={'request': request})
        return Response(playedExpansionsSerializers.data)

    def post(self, request):
        playedExpansion = PlayedExpansionsSerializers(data=request.data, many=True, context={'request': request})
        if playedExpansion.is_valid():
            playedExpansion.save()
            return Response(playedExpansion.data, status=status.HTTP_201_CREATED)
        return Response(playedExpansion.errors, status=status.HTTP_400_BAD_REQUEST)        

#Detailed Points Detail
class PlayedExpansionDetail(APIView):
    def get(self, request, pk):
        playedExpansion = PlayedExpansions.objects.filter(pk = pk)
        playedExpansionsSerializers = PlayedExpansionsSerializers(playedExpansion, many=True, context={'request': request})
        return Response(playedExpansionsSerializers.data)

    def get_object(self, pk):
        try:
            return PlayedExpansions.objects.get(pk=pk)
        except PlayedExpansions.DoesNotExist:
            return 0
    
    def put(self, request, pk):
        playedExpansion = self.get_object(pk)
        detailedPointsSerializers = PlayedExpansionsSerializers(playedExpansion, data=request.data, context={'request': request})
        if playedExpansionsSerializers.is_valid():
            playedExpansionsSerializers.save()
            return Response(playedExpansionsSerializers.data)
        return Response(playedExpansionsSerializers.errors, status=status.HTTP_400_BAD_REQUEST)
    
    def delete(self, request, pk):
        auth_user = self.request.user
        if(auth_user.is_staff):
            playedExpansion = self.get_object(pk)
            playedExpansion.delete()
            return Response(status=status.HTTP_204_NO_CONTENT)

# Detailed points list
class DetailedPointsList(APIView):
    def get(self, request):
        detailedPoints = DetailedPoints.objects.all()
        detailedPointsSerializers = DetailedPointsSerializers(detailedPoints, many=True, context={'request': request})
        return Response(detailedPointsSerializers.data)

    def post(self, request):
        detailedPoints = DetailedPointsSerializers(data=request.data, many=True, context={'request': request})
        if detailedPoints.is_valid():
            detailedPoints.save()
            return Response(detailedPoints.data, status=status.HTTP_201_CREATED)
        return Response(detailedPoints.errors, status=status.HTTP_400_BAD_REQUEST)        

#Detailed Points Detail
class DetailedPointDetail(APIView):
    def get(self, request, pk):
        detailedPoints = DetailedPoints.objects.filter(pk = pk)
        detailedPointsSerializers = DetailedPointsSerializers(detailedPoints, many=True, context={'request': request})
        return Response(detailedPointsSerializers.data)

    def get_object(self, pk):
        try:
            return DetailedPoints.objects.get(pk=pk)
        except DetailedPoints.DoesNotExist:
            return 0
    
    def put(self, request, pk):
        detailedPoints = self.get_object(pk)
        detailedPointsSerializers = DetailedPointsSerializers(detailedPoints, data=request.data, context={'request': request})
        if detailedPointsSerializers.is_valid():
            detailedPointsSerializers.save()
            return Response(detailedPointsSerializers.data)
        return Response(detailedPointsSerializers.errors, status=status.HTTP_400_BAD_REQUEST)
    
    def delete(self, request, pk):
        auth_user = self.request.user
        if(auth_user.is_staff):
            detailedPoints = self.get_object(pk)
            detailedPoints.delete()
            return Response(status=status.HTTP_204_NO_CONTENT)

# Scoring fields list
class ScoringFieldsList(APIView):
    def get(self, request):
        scf = ScoringFields.objects.all()
        scoringfieldsSerializers = ScoringFieldsSerializers(scf, many=True, context={'request': request})
        return Response(scoringfieldsSerializers.data)

    def post(self, request):
        scf = ScoringFieldsSerializers(data=request.data, many=True, context={'request': request})
        if scf.is_valid():
            scf.save()
            return Response(scf.data, status=status.HTTP_201_CREATED)
        return Response(scf.errors, status=status.HTTP_400_BAD_REQUEST)

#Scoring field Detail
class ScoringFieldDetail(APIView):
    def get(self, request, pk):
        scf = ScoringFields.objects.filter(pk = pk)
        scoringfieldsSerializers = ScoringFieldsSerializers(scf, many=True, context={'request': request})
        return Response(scoringfieldsSerializers.data)

    def get_object(self, pk):
        try:
            return ScoringFields.objects.get(pk=pk)
        except ScoringFields.DoesNotExist:
            return 0

    def put(self, request, pk):
        scf = self.get_object(pk)
        scoringfieldsSerializers = ScoringFieldsSerializers(scf, data=request.data, context={'request': request})
        if scoringfieldsSerializers.is_valid():
            scoringfieldsSerializers.save()
            return Response(scoringfieldsSerializers.data)
        return Response(scoringfieldsSerializers.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, pk):
        auth_user = self.request.user
        if(auth_user.is_staff):
            scf = self.get_object(pk)
            scf.delete()
            return Response(status=status.HTTP_204_NO_CONTENT)

#Designer Detail
class DesignerDetail(APIView):
    def get(self, request, pk):
        designer = Designer.objects.filter(pk = pk)
        designerSerializers = DesignersSerializers(designer, many=True, context={'request': request})
        return Response(designerSerializers.data)

#Category Detail
class CategoryDetail(APIView):
    def get(self, request, pk):
        category = Category.objects.filter(pk = pk)
        categorySerializers = CategoriesSerializers(category, many=True, context={'request': request})
        return Response(categorySerializers.data)