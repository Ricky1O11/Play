import firebase_admin
from firebase_admin import credentials
from firebase_admin import db

import json
from os import listdir
from os.path import isfile, join

# Retrieve data from json representation of boardgamegeek database
def populateDB():
    in_files = [f for f in listdir("Server/Play/jsons/trial") if isfile(join("Server/Play/jsons/trial", f))]
    expansionsDict = {}
    for in_file in in_files:
        #in_file = "bgg_1_500.json"
        file = open(join("Server/Play/jsons/trial", in_file), "r")
        text = file.read()

        data = json.loads(text)
        file.close()
        #try:
        boundaries = [int(s) for s in in_file.replace(".","_").split("_") if s.isdigit()]

        for i in range(int(boundaries[0]),int(boundaries[1])):
            if(str(i) in data):

                game = data[str(i)]
                if("rpgartist" in game or 
                    "rpgdesigner" in game or 
                    "rpgpublisher" in game or 
                    "videogamedeveloper" in game or
                    "videogamepublisher" in game):
                    print "Not a boardgame: skipped"
                else:
                    last_inserted = boardgames_ref.order_by_key().limit_to_last(1).get()
                    if(last_inserted):
                        key, value = last_inserted.items()[0]
                        if(value["bggId"] < i):
                            boardgame = addBoardgame(i, game)
                            addCategories(game, boardgame)
                            addDesigners(game, boardgame)
                            addPublishers(game, boardgame)
                            #addDesigners(game, boardgame)
                            #if("boardgamedesigner" in game):
                            #    for des in game["boardgamedesigner"]:
                            #            designers_ref.child(des).child(str(i)).set(gameSimpleObject)
                            #            gameHasDesigners_ref.child(str(i)).child(des).set(True)
                            #if("boardgamepublisher" in game):
                            #    for pub in game["boardgamepublisher"]:
                            #            publishers_ref.child(pub).child(str(i)).set(gameSimpleObject)
                            #            gameHasPublishers_ref.child(str(i)).child(pub).set(True)
                        else:
                            print "Already in the DB: skipped"
                    else:
                            boardgame = addBoardgame(i, game)
                            addCategories(game, boardgame)
                            addDesigners(game, boardgame)
                            addPublishers(game, boardgame)
        return True

def addBoardgame(i, game):
    print "Boardgame id: " + str(i)
    gameCompleteObject = {}
    gameSimpleObject = {}
    gameCompleteObject["bggId"] = i
    gameSimpleObject["bggId"] = i
    #gameCompleteObject = {}
    if("average" in game):
        if(game["average"] != "null"):
            gameCompleteObject["average"] = game["average"]
    if("description" in game):
        gameCompleteObject["description"] = game["description"]
    if("image" in game):
        gameCompleteObject["image"] = game["image"]
    if("name" in game):
        gameCompleteObject["name"] = game["name"]
        gameSimpleObject["name"] = game["name"]
    if("usersrated" in game):
        gameCompleteObject["usersrated"] = game["usersrated"]
    if("maxplayers" in game):
        gameCompleteObject["maxplayers"] = game["maxplayers"]
    if("maxplaytime" in game):
        gameCompleteObject["maxplaytime"] = game["maxplaytime"]
    if("age" in game):
        gameCompleteObject["age"] = game["age"]
    if("minplayers" in game):
        gameCompleteObject["minplayers"] = game["minplayers"]
    if("minplaytime" in game):
        gameCompleteObject["minplaytime"] = game["minplaytime"]
    if("playingtime" in game):
        gameCompleteObject["playingtime"] = game["playingtime"]
    if("yearpublished" in game):
        gameCompleteObject["yearpublished"] = game["yearpublished"]
    if("thumbnail" in game):
        gameCompleteObject["thumbnail"] = game["thumbnail"]
        gameSimpleObject["thumbnail"] = game["thumbnail"]
    new_boardgame = boardgames_ref.push(gameCompleteObject)
    return {"id": new_boardgame.key, "completeObject":gameCompleteObject, "simpleObject": gameSimpleObject}

def addCategories(game, boardgame):
    if("boardgamecategory" in game):
        for cat in game["boardgamecategory"]:
            db_cat = categories_ref.order_by_child("name").equal_to(cat).limit_to_first(1).get()
            if db_cat:
                #print db_cat
                key, value = db_cat.items()[0]
                category = categories_ref.child(key)
            else:
                category = categories_ref.push()
                category.update({"name": cat})
            category.child("boardgames").child(boardgame["id"]).set(boardgame["simpleObject"])
            gameHasCategories_ref.child(boardgame["id"]).child(category.key).set(category.get()["name"])

def addDesigners(game, boardgame):
    if("boardgamedesigner" in game):
        for des in game["boardgamedesigner"]:
            db_des = designers_ref.order_by_child("name").equal_to(des).limit_to_first(1).get()
            if db_des:
                #print db_des
                key, value = db_des.items()[0]
                designer = designers_ref.child(key)
            else:
                designer = designers_ref.push()
                designer.update({"name": des})
            designer.child("boardgames").child(boardgame["id"]).set(boardgame["simpleObject"])
            gameHasDesigners_ref.child(boardgame["id"]).child(designer.key).set(designer.get()["name"])

def addPublishers(game, boardgame):
    if("boardgamepublisher" in game):
        for pub in game["boardgamepublisher"]:
            db_pub = publishers_ref.order_by_child("name").equal_to(pub).limit_to_first(1).get()
            if db_pub:
                #print db_des
                key, value = db_pub.items()[0]
                publisher = publishers_ref.child(key)
            else:
                publisher = publishers_ref.push()
                publisher.update({"name": pub})
            publisher.child("boardgames").child(boardgame["id"]).set(boardgame["simpleObject"])
            gameHasPublishers_ref.child(boardgame["id"]).child(publisher.key).set(publisher.get()["name"])


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
    gameHasCategories_ref = ref.child('gameHasCategories')

    designers_ref = ref.child('designers')
    gameHasDesigners_ref = ref.child('gameHasDesigners')

    publishers_ref = ref.child('publishers')
    gameHasPublishers_ref = ref.child('gameHasPublishers')

    dbPopulated = populateDB()

                    #    if("boardgamecategory" in game):
                    #        for cat in game["boardgamecategory"]:
                    #            categorydb = Category()
                    #            category = Category.objects.filter(name = cat)
                    #            if(category.count() == 0):
                    #                categorydb.name = cat
                    #                categorydb.save()
                    #                currentCategory = categorydb
                    #            else:
                    #                currentCategory = category[0]
                    #            belongsdb = BelongsToTheCategory()
                    #            belongsdb.category =  currentCategory
                    #            belongsdb.boardgame = gameCompleteObject
                    #            belongsdb.save()
#
                    #    if("boardgamedesigner" in game):
                    #        for des in game["boardgamedesigner"]:
                    #            designerdb = Designer()
                    #            designer = Designer.objects.filter(name = des)
                    #            if(designer.count() == 0):
                    #                designerdb.name = des
                    #                designerdb.save()
                    #                currentDesigner = designerdb
                    #            else:
                    #                currentDesigner = designer[0]
                    #            designedbydb = IsDesignedBy()
                    #            designedbydb.designer =  currentDesigner
                    #            designedbydb.boardgame = gameCompleteObject
                    #            designedbydb.save()
#
                    #    if("boardgamepublisher" in game):
                    #        for pub in game["boardgamepublisher"]:
                    #            publisherdb = Publisher()
                    #            publisher = Publisher.objects.filter(name = pub)
                    #            if(publisher.count() == 0):
                    #                publisherdb.name = pub
                    #                publisherdb.save()
                    #                currentPublisher = publisherdb
                    #            else:
                    #                currentPublisher = publisher[0]
                    #            publishedbydb = IsPublishedBy()
                    #            publishedbydb.publisher=  currentPublisher
                    #            publishedbydb.boardgame = gameCompleteObject
                    #            publishedbydb.save()

# Retrieve data from json representation of boardgamegeek database
def addExpansionsFromBgg(self):
    in_files = [f for f in listdir("jsons") if isfile(join("jsons", f))]
    expansionsDict = {}
    for in_file in in_files:
        #in_file = "bgg_1_500.json"
        file = open(join("jsons", in_file), "r")
        text = file.read()

        data = json.loads(text)
        file.close()
        #try:
        boundaries = [int(s) for s in in_file.replace(".","_").split("_") if s.isdigit()]

        for i in range(int(boundaries[0]),int(boundaries[1])):

            if(str(i) in data):
                game = data[str(i)]
                gameCompleteObject = Boardgames()
                if("rpgartist" in game or 
                    "rpgdesigner" in game or 
                    "rpgpublisher" in game or 
                    "videogamedeveloper" in game or
                    "videogamepublisher" in game):
                    continue
                else:
                    if("boardgameexpansion" in game): #if the game has expansions
                        boardgame_record = Boardgames.objects.filter(bggid = i)
                        print "Boardgame id: " + str(i) + " with expansions"
                        for expansion_id in game["boardgameexpansion"]:
                            expansion = Boardgames.objects.filter(bggid = expansion_id)
                            if(expansion.count() == 1):
                                exprelation = IsExpansionOf.objects.filter(boardgame1 = expansion[0], boardgame2 = boardgame_record[0])
                                if(exprelation.count() != 1):
                                    expansionofdb = IsExpansionOf()
                                    expansionofdb.boardgame1=  expansion[0]
                                    expansionofdb.boardgame2 = boardgame_record[0]
                                    expansionofdb.save()