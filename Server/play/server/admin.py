from django.contrib import admin

# Register your models here.
from .models import *

admin.site.register(Boardgames)
admin.site.register(Profile)
admin.site.register(Matches)
admin.site.register(PlayedExpansions)
admin.site.register(Plays)
admin.site.register(Friends)
admin.site.register(Favourites)
admin.site.register(Dictionary)
admin.site.register(Templates)
admin.site.register(ScoringFields)
admin.site.register(DetailedPoints)
admin.site.register(Category)
admin.site.register(BelongsToTheCategory)
admin.site.register(Designer)
admin.site.register(IsDesignedBy)
admin.site.register(Publisher)
admin.site.register(IsPublishedBy)
admin.site.register(IsExpansionOf)
admin.site.register(BelongsToTheFamily)
admin.site.register(TemplateVotes)
