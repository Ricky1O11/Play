from django.contrib import admin

# Register your models here.
from .models import Boardgames, Users, Matches, Friends, Plays, Favourites

admin.site.register(Boardgames)
admin.site.register(Users)
admin.site.register(Matches)
admin.site.register(Friends)
admin.site.register(Plays)
admin.site.register(Favourites)
