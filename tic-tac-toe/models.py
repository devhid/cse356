# library imports
from flask_login import UserMixin

# system imports
from datetime import datetime

# internal imports
import itertools

class User(UserMixin):
    def __init__(self, username):
        self.username = username
        self.total_games = 0
        self.wins = 0
        self.losses = 0
        self.ties = 0

    def get_id(self):
        return self.username

class TicTacToeGame:
    def __init__(self, game_id):
        self.game_id = game_id
        self.start_date = datetime.today().strftime('%Y-%m-%d, %H:%M:%S')
        self.grid = [" " for i in range(9)]
        self.winner = " "
    
    def to_dict(self):
        return {
            "id": self.game_id,
            "start_date": self.start_date,
            "grid": self.grid,
            "winner": self.winner
        }



