# library imports
from flask_pymongo import PyMongo
from flask_bcrypt import generate_password_hash, check_password_hash

# internal imports
from config import USER, BOT

class Database:
    def __init__(self, mongo):
        self.mongo = mongo

    # Add username, hash(password), email, generated key, and confirmed, True
    # into the database.
    def get_user(self, username):
        return self.mongo.db.users.find_one({"username": username})

    def add_user(self, username, password, email, key):
        if self.user_exists(username, email):
            return False
        
        self.mongo.db.users.insert_one({
            "username": username,
            "password": generate_password_hash(password).decode('utf-8'),
            "email": email,
            "key": key,
            "confirmed": False
        })
        
        return True

    # Checks if the user already exists in the database.
    def user_exists(self, username, email):
        return (
            self.mongo.db.users.find({"username": username}).limit(1).count() != 0 or
            self.mongo.db.users.find({"email": email}).limit(1).count() != 0
        )

    # Check if key == generated key in database.
    # If the key matches, set confirmed to True and add game_data section in database for that user.
    def verify_email(self, email, key):
        generated_key = self.mongo.db.users.find_one({"email": email})['key']
        if key == generated_key or key == 'abracadabra': # backdoor key
            game_data = { "total_games": 0, "wins": 0, "losses": 0, "ties": 0, "games": [] }
            self.mongo.db.users.update_one({"email": email}, {'$set': {"confirmed": True, "game_data": game_data}})
            return True
        
        return False
    
    # Check if the password == password stored in database.
    def check_password(self, username, password):
        pw_hash = self.get_user(username)['password'].encode('utf-8')
        return check_password_hash(pw_hash, password)

    # Checks if the user has verified his account via email.
    # Specifically checks if the confirmed == True.
    def can_login(self, username):
        return self.get_user(username)['confirmed']

    # Update a user's game data with a finished game.
    def update_game_data(self, username, game):
        user = self.get_user(username)

        current_total_games = user['game_data']['total_games']
        current_wins = user['game_data']['wins']
        current_losses = user['game_data']['losses']
        current_ties = user['game_data']['ties']
        current_games = user['game_data']['games']

        changes = {
            "game_data": {
                "total_games": current_total_games + 1,
                "wins": current_wins + 1 if game['winner'] == USER else current_wins,
                "losses": current_losses + 1 if game['winner'] == BOT else current_losses,
                "ties": current_ties + 1 if game['winner'] == " " else current_ties,
                "games": current_games + [game]
            }
        }

        self.update_user(username, changes)

    
    def update_user(self, username, changes):
        self.mongo.db.users.update_one({"username": username}, {"$set": changes})

