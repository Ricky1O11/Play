from django.db.models import Q
from rest_framework import serializers
from .models import *
from django.db.models import Count, Max

# Json representation of the dictionary
class DictionarySerializers(serializers.ModelSerializer):
    class Meta:
        model = Dictionary
        fields = ('pk', 'word', 'description')

class SimpleBoardgamesSerializers(serializers.ModelSerializer):
    class Meta:
        model = Boardgames
        fields = ('pk', 'title', 'thumbnail', 'img',)

class ProfileSerializers(serializers.ModelSerializer):
    class Meta:
        model = Profile
        fields = ('pk', 'img', 'rec_setting', 'fav_setting', 'visibility_group')

# Json representation of users and statistics
class UserRegisterSerializers(serializers.ModelSerializer):

    class Meta:
        model = User
        fields = ('pk', 'username', 'password', 'email')
        write_only_fields = ('password',)

    def create(self, validated_data):
        user = User.objects.create(
            username=validated_data['username'],
            email=validated_data['email'],
        )

        user.set_password(validated_data['password'])
        user.save()

        return user


# Json representation of users and statistics
class UsersSerializers(serializers.ModelSerializer):
    # Serializer initialization: read the url params
    def __init__(self, *args, **kwargs):
        super(UsersSerializers, self).__init__(*args, **kwargs)
        # Allowed params: "include"
        includes = self.context['request'].query_params.get('include')

        if includes:
            fields = includes.split(',')
            allowed = set(fields)

            # Allowed values: "user_stats"
            if "user_stats" not in allowed:
                self.fields.pop("match_played")
                self.fields.pop("most_played_game")
                self.fields.pop('match_won')
        else:
            self.fields.pop("match_played")
            self.fields.pop("most_played_game")
            self.fields.pop('match_won')

    match_played = serializers.SerializerMethodField()
    most_played_game = serializers.SerializerMethodField()
    match_won = serializers.SerializerMethodField()
    match_played_with = serializers.SerializerMethodField()
    profile_details = serializers.SerializerMethodField()
    
    friendship = serializers.SerializerMethodField()

    def get_friendship(self, user):
        auth_user = self.context['request'].user
        friendship = (Friends.objects.filter(user1 = auth_user, user2 = user) | Friends.objects.filter(user1 = user, user2 = auth_user)).values('pk')
        if (friendship.count() > 0):
            return friendship[0]["pk"]
        else:
            return 0

    # Get the profile details
    def get_profile_details(self, user):
        profile = Profile.objects.get(user=user)
        serializer = ProfileSerializers(profile , context={'request': self.context['request']})
        return serializer.data

    # Get the amount of match played by the user, given a boardgame (total if not given)
    def get_match_played(self, user):
        if ("boardgame" in self.context):
            boardgame = self.context["boardgame"]
            plays_amount = Plays.objects.filter(match__boardgame=boardgame, user=user).count()
        else:
            plays_amount = Plays.objects.filter(user=user).count()
        return plays_amount

    # Get the most played game
    def get_most_played_game(self, user):
        games = Boardgames.objects.filter(matches__plays__user=user).annotate(amount=Count('matches')).order_by(
            '-amount')
        if(len(games) !=0):
            return games[0].title
        else:
            return "No game played"

    # Get the number of match that the authenticated user has played with this user
    def get_match_played_with(self, user):  
        auth_user = self.context['request'].user.pk
        match_played_with = Matches.objects.filter(plays__user=user).filter(plays__user=auth_user).count()
        return match_played_with

    # Get the amount of match won by the user, given a boardgame (total if not given)
    def get_match_won(self, user):
        if ("boardgame" in self.context):
            boardgame = self.context["boardgame"]
            # Extract the match-points pair from the plays table, stating the highest result for each match.
            #.values() returns a dictionary (json)
            match_won = Matches.objects.filter(winner = user, match__boardgame=boardgame).count()
        else:
            # Extract the match-points pair from the plays table, stating the highest result for each match.
            #.values() returns a dictionary (json) and, aggregate with the "Max" function, performs a group by operation
            #The dictionary cannot be further analyzed because we have not visibility of the other fields of the record.
            match_won = Matches.objects.filter(winner = user).count()

        return match_won

    class Meta:
        model = User
        fields = ('pk', 'username', 'first_name', 'last_name', 'email', 'friendship', 'match_played', 'most_played_game', 'match_won', 'profile_details', 'match_played_with')

# Json representation of the template of a boardgames
class ScoringFieldsSerializers(serializers.ModelSerializer):
    word_details = serializers.SerializerMethodField()

    def get_word_details(self, scField):
        word = Dictionary.objects.get(scoringfields=scField)
        serializer = DictionarySerializers(word , context={'request': self.context['request']})
        return serializer.data

    class Meta:
        model = ScoringFields
        fields = ('pk', 'template', 'word', 'word_details')

# Json representation of the template of a boardgames
class TemplatesSerializers(serializers.ModelSerializer):
    scoringField_details = serializers.SerializerMethodField()

    def get_scoringField_details(self, template):
        score = ScoringFields.objects.filter(template=template)
        serializer = ScoringFieldsSerializers(score, many=True, context={'request': self.context['request']})
        return serializer.data

    class Meta:
        model = Templates
        fields = ('pk', 'boardgame', 'vote', 'scoringField_details')

# Json representation of the detailed points of a single play
class DetailedPointsSerializers(serializers.ModelSerializer):
    scoringField_details = serializers.SerializerMethodField()

    def get_scoringField_details(self, dtPoints):
        score = ScoringFields.objects.get(detailedpoints=dtPoints)
        serializer = ScoringFieldsSerializers(score, context={'request': self.context['request']})
        return serializer.data

    class Meta:
        model = DetailedPoints
        fields = ( 'pk','play', 'detailed_points', 'scoringField_details', 'scoringField', 'notes')

# Json representation of single plays
class PlaysSerializers(serializers.ModelSerializer):
    user_details = serializers.SerializerMethodField()
    detailedPoints = serializers.SerializerMethodField()

    def get_user_details(self, play):
        user = User.objects.get(plays=play)
        serializer = UsersSerializers(user, context={'request': self.context['request']})
        return serializer.data

    def get_detailedPoints(self, play):
        dtPoints = DetailedPoints.objects.filter(play=play)
        serializer = DetailedPointsSerializers(dtPoints, many=True, context={'request': self.context['request']})
        return serializer.data

    class Meta:
        model = Plays
        fields = ('pk', 'match', 'user', 'user_details', 'points', 'detailedPoints')

# Json representation of single matches
class MatchesSerializers(serializers.ModelSerializer):
    plays_set = PlaysSerializers(many=True, read_only=True)
    boardgame_details = serializers.SerializerMethodField()

    def __init__(self, *args, **kwargs):
        super(MatchesSerializers, self).__init__(*args, **kwargs)
        # Allowed params: "include"
        includes = self.context['request'].query_params.get('include')
        if includes:
            fields = includes.split(',')
            allowed = set(fields)

            # Allowed values: "matches", "users", "friends", "favourite"
            if "boardgame" not in allowed:
                self.fields.pop("boardgame")
        else:
            self.fields.pop("boardgame")

    def get_boardgame_details(self, match):
        boardgame = Boardgames.objects.get(matches=match)
        serializer = SimpleBoardgamesSerializers(boardgame)
        return serializer.data

    class Meta:
        model = Matches
        fields = ('pk', 'boardgame', 'name', 'time', 'location', 'status', 'boardgame_details', 'duration', 'plays_set', 'winner')

# Json representation of designers
class DesignersSerializers(serializers.ModelSerializer):
    def __init__(self, *args, **kwargs):
        super(DesignersSerializers, self).__init__(*args, **kwargs)
        # Allowed params: "include"
        includes = self.context['request'].query_params.get('include')
        if includes:
            fields = includes.split(',')
            allowed = set(fields)

            # Allowed values: "matches", "users", "friends", "favourite"
            if "boardgames" not in allowed:
                self.fields.pop("boardgames")
        else:
            self.fields.pop("boardgames")
    boardgames = serializers.SerializerMethodField()

    def get_boardgames(self, designer):
        boardgames = Boardgames.objects.filter(isdesignedby__designer = designer)
        serializer = SimpleBoardgamesSerializers(boardgames , many=True)
        return serializer.data
    class Meta:
        model = Designer
        fields = ('pk', 'name', 'boardgames')

# Json representation of designers
class PublishersSerializers(serializers.ModelSerializer):
    def __init__(self, *args, **kwargs):
        super(PublishersSerializers, self).__init__(*args, **kwargs)
        # Allowed params: "include"
        includes = self.context['request'].query_params.get('include')
        if includes:
            fields = includes.split(',')
            allowed = set(fields)

            # Allowed values: "matches", "users", "friends", "favourite"
            if "boardgames" not in allowed:
                self.fields.pop("boardgames")
        else:
            self.fields.pop("boardgames")
    boardgames = serializers.SerializerMethodField()

    def get_boardgames(self, publisher):
        boardgames = Boardgames.objects.filter(ispublishedby__publisher = publisher)
        serializer = SimpleBoardgamesSerializers(boardgames , many=True)
        return serializer.data
    class Meta:
        model = Designer
        fields = ('pk', 'name', 'boardgames')

# Json representation of categories
class CategoriesSerializers(serializers.ModelSerializer):
    def __init__(self, *args, **kwargs):
        super(CategoriesSerializers, self).__init__(*args, **kwargs)
        # Allowed params: "include"
        includes = self.context['request'].query_params.get('include')
        if includes:
            fields = includes.split(',')
            allowed = set(fields)

            # Allowed values: "matches", "users", "friends", "favourite"
            if "boardgames" not in allowed:
                self.fields.pop("boardgames")
        else:
            self.fields.pop("boardgames")
    boardgames = serializers.SerializerMethodField()

    def get_boardgames(self, category):
        boardgames = Boardgames.objects.filter(belongstothecategory__category = category)
        serializer = SimpleBoardgamesSerializers(boardgames , many=True)
        return serializer.data
    class Meta:
        model = Designer
        fields = ('pk', 'name', 'boardgames')

# Json representation of boardgames and statistics
class BoardgamesSerializers(serializers.ModelSerializer):
    # Serializer initialization: read the url params
    def __init__(self, *args, **kwargs):
        super(BoardgamesSerializers, self).__init__(*args, **kwargs)

        # Allowed params: "include"
        includes = self.context['request'].query_params.get('include')
        if includes:
            fields = includes.split(',')
            allowed = set(fields)

            # Allowed values: "matches", "users", "friends", "favourite"
            if "matches" not in allowed:
                self.fields.pop("matches")
            if "users" not in allowed:
                self.fields.pop("users")
            if "friends" not in allowed:
                self.fields.pop("friends")
        else:
            self.fields.pop("matches")
            self.fields.pop("friends")
            self.fields.pop("users")

    matches = serializers.SerializerMethodField()
    users = serializers.SerializerMethodField()
    friends = serializers.SerializerMethodField()
    favourite = serializers.SerializerMethodField()
    designers = serializers.SerializerMethodField()
    publishers = serializers.SerializerMethodField()
    categories = serializers.SerializerMethodField()
    expansions = serializers.SerializerMethodField()
    expands = serializers.SerializerMethodField()

    # Get matches played given a boardgame and a user (all matches if user is not provided)
    def get_matches(self, boardgame):
        auth_user = self.context['request'].user.pk
        if auth_user:
            matches = Matches.objects.filter(boardgame=boardgame, plays__user=auth_user)
        else:
            matches = Matches.objects.filter(boardgame=boardgame)

        serializer = MatchesSerializers(matches, many=True, context={'request': self.context['request']})
        return serializer.data

    # Get list of users playing a boardgame
    def get_users(self, boardgame):
        users = User.objects.filter(plays__match__boardgame=boardgame).distinct()
        serializer = UsersSerializers(users, many=True,
                                      context={'request': self.context['request'], 'boardgame': boardgame})
        return serializer.data

    # Get list of all friend playing a boardgame, given a user
    def get_friends(self, boardgame):
        auth_user = self.context['request'].user
        if auth_user.is_authenticated():
            friends = Users.objects.filter(plays__match__boardgame=boardgame,
                                           user2__user1=auth_user).distinct() | Users.objects.filter(
                                            plays__match__boardgame=boardgame,
                                            user1__user2=auth_user).distinct()
            serializer = UsersSerializers(friends, many=True,
                                          context={'request': self.context['request'], 'boardgame': boardgame})
            return serializer.data

    def get_favourite(self, boardgame):
        auth_user = self.context['request'].user
        if auth_user.is_authenticated():
            favourite = Favourites.objects.filter(boardgame=boardgame, user=auth_user).values('pk')
            if(favourite.count()>0):
                return favourite[0]["pk"]
            else:
                return -1
        else: return -1

    # Get list of designers
    def get_designers(self, boardgame):
        designers = Designer.objects.filter(isdesignedby__boardgame=boardgame).distinct()
        serializer = DesignersSerializers(designers, many=True,
                                      context={'request': self.context['request'], 'boardgame': boardgame})
        return serializer.data

    # Get list of designers
    def get_publishers(self, boardgame):
        publishers = Publisher.objects.filter(ispublishedby__boardgame=boardgame).distinct()
        serializer = PublishersSerializers(publishers, many=True,
                                      context={'request': self.context['request'], 'boardgame': boardgame})
        return serializer.data

    # Get list of designers
    def get_categories(self, boardgame):
        categories = Category.objects.filter(belongstothecategory__boardgame=boardgame).distinct()
        serializer = CategoriesSerializers(categories, many=True,
                                      context={'request': self.context['request'], 'boardgame': boardgame})
        return serializer.data

    # Get list of expansions
    def get_expansions(self, boardgame):
        boardgames = Boardgames.objects.filter(boardgameE1__boardgame2=boardgame)
        serializer = SimpleBoardgamesSerializers(boardgames, many=True,
                                      context={'request': self.context['request'], 'boardgame': boardgame})
        return serializer.data

    # Get father game
    def get_expands(self, boardgame):
        boardgames = Boardgames.objects.filter(boardgameE2__boardgame1=boardgame)
        serializer = SimpleBoardgamesSerializers(boardgames, many=True,
                                      context={'request': self.context['request'], 'boardgame': boardgame})
        return serializer.data

    class Meta:
        model = Boardgames
        fields = ('pk', 'title','description', 'img', 'thumbnail', 'average', 'minage', 
                    'playingtime', 'minplayers', 'maxplayers', 'yearpublished', 'maxplaytime', 
                    'minplaytime', 'usersrated', 'matches', 'users', 'friends', 'favourite', 'designers',
                    'publishers', 'categories', 'expansions', 'expands')
        ordering = ('favourite',)

# Json representation of friends
class FriendsSerializers(serializers.ModelSerializer):
    user1_details = serializers.SerializerMethodField()
    user2_details = serializers.SerializerMethodField()

    def get_user1_details(self, friendship):
        user = User.objects.get(user1=friendship)
        serializer = UsersSerializers(user, context={'request': self.context['request']})
        return serializer.data

    def get_user2_details(self, friendship):
        user = User.objects.get(user2=friendship)
        serializer = UsersSerializers(user, context={'request': self.context['request']})
        return serializer.data

    class Meta:
        model = Friends
        fields = ('pk', 'user1','user2', 'user1_details', 'user2_details')

# Json representation of favourites boardgames by an user
class FavouritesSerializers(serializers.ModelSerializer):
    class Meta:
        model = Favourites
        fields = ('pk', 'user','boardgame')

