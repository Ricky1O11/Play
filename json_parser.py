import firebase_admin
from firebase_admin import credentials
from firebase_admin import db

import json
from os import listdir
from os.path import isfile, join

# Retrieve data from json representation of boardgamegeek database
def populateDB():
    in_files = [f for f in listdir("jsons/trial") if isfile(join("jsons/trial", f))]
    expansionsDict = {}

    basicTemplate = {
        "has_expansions" : False,
        "name" : "Basic Template",
        "scoring_fields" : {
            0 : {
                "bonus" : 1,
                "name" : {
                    "it" : "Punti",
                    "en" : "Points"
                }
            }
        }
    }
    current_boardgames = boardgames_ref.get()

    for in_file in in_files:
        #in_file = "bgg_1_500.json"
        file = open(join("jsons/trial", in_file), "r")
        text = file.read()

        data = json.loads(text)
        file.close()
        boundaries = [int(s) for s in in_file.replace(".","_").split("_") if s.isdigit()]

        for i in range(int(boundaries[0]),int(boundaries[1])):
            if(str(i) in data and str(i) not in current_boardgames):
                game = data[str(i)]
                if("rpgartist" in game or 
                    "rpgdesigner" in game or 
                    "rpgpublisher" in game or 
                    "videogamedeveloper" in game or
                    "videogamepublisher" in game):
                    print "Not a boardgame: skipped"
                else:
                    boardgame = addBoardgame(i, game)
                    template = addTemplate(i, basicTemplate)
                    #addCategories(game, boardgame)
                    #addDesigners(game, boardgame)
                    #addPublishers(game, boardgame)
        return True

def addBoardgame(i, game):
    basics_field_array = ["bggId", "average", "description", "image", "name", "usersrated", 
    "maxplayers", "minplayers", "maxplaytime", "minplaytime", "age", "playingtime", "yearpublished", "thumbnail", "expands", "is_expanded_by"]

    print "Boardgame id: " + str(i)
    gameCompleteObject = {}
    gameSimpleObject = {}
    gameCompleteObject["bggId"] = i
    gameSimpleObject["bggId"] = i
    
    for field in basics_field_array:
        if(field in game):
            gameCompleteObject[field] = game[field]
            if (field == "is_expanded_by"):
                for bggId in gameCompleteObject[field]:
                    bg = boardgames_ref.child(str(bggId))
                    bg_get = bg.get()
                    if bg_get != None:
                        gameCompleteObject[field][bggId] = {"name": bg_get["name"], "thumbnail": bg_get["thumbnail"], "image": bg_get["image"]}
                        bg.child("expands").child(str(i)).update({"name": game["name"], "thumbnail": game["thumbnail"], "image": game["image"]})
            
            if (field == "expands"):
                for bggId in gameCompleteObject[field]:
                    bg = boardgames_ref.child(str(bggId))
                    if bg.get() != None:
                        gameCompleteObject[field][bggId] = {"name": bg_get["name"], "thumbnail": bg_get["thumbnail"], "image": bg_get["image"]}
                        bg.child("is_expanded_by").child(str(i)).update({"name": game["name"], "thumbnail": game["thumbnail"], "image": game["image"]})
        
        if field == "name" or field == "thumbnail" or field == "average":
            gameSimpleObject[field] = game[field]
    if("boardgamecategory" in game):
        gameCompleteObject["categories"] = game["boardgamecategory"]
        addFields("categories", game["boardgamecategory"], gameSimpleObject)
    if("boardgamedesigner" in game):
        gameCompleteObject["designers"] = game["boardgamedesigner"]
        addFields("designers", game["boardgamedesigner"], gameSimpleObject)
    #if("boardgamepublisher" in game):
    #    gameCompleteObject["publishers"] = game["boardgamepublisher"]
    #    addFields("publishers", game["boardgamepublisher"], gameSimpleObject)

    new_boardgame = boardgames_ref.child(str(i)).set(gameCompleteObject)


def addFields(field, val, boardgame):
    for key in val:
        references_dictionary[field].child(key).update(val[key])
        references_dictionary[field].child(key).child("boardgames").child(str(boardgame["bggId"])).set(boardgame)

def addTemplate(bggId, template):
        ref.child('boardgame_has_templates').child(str(bggId)).child("0").set(template)

################MAIN FUNCTION####################
if __name__ == "__main__":
    cred = credentials.Certificate('Server/Play/config/play-5d098-firebase-adminsdk-lxldu-abcee1bab7.json')
    default_app = firebase_admin.initialize_app(cred, {
        'databaseURL': 'https://play-5d098.firebaseio.com/'
    })

    # As an admin, the app has access to read and write all data, regradless of Security Rules
    ref = db.reference()
    boardgames_ref = ref.child('boardgames')
    categories_ref = ref.child('categories')
    designers_ref = ref.child('designers')
    publishers_ref = ref.child('publishers')

    references_dictionary = {
        "categories" : categories_ref,
        "designers" : designers_ref,
        "publishers" : publishers_ref,
    }
    dbPopulated = populateDB()