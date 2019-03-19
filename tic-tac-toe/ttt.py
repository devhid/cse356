# library imports
from flask import Flask, redirect, render_template, url_for, request, session, jsonify, flash, session
from flask_pymongo import PyMongo
from flask_mail import Mail
from flask_login import LoginManager, current_user, login_user, logout_user, login_required

# system imports
import datetime
import secrets

# internal imports
from util.game_util import num_filled, check_winner
from util.email_util import send_verification_email
from bot import bot_move
from database import Database
from models import User, TicTacToeGame

app = Flask(__name__)
app.config.from_pyfile('config.py')

# get players
USER = app.config['USER']
BOT = app.config['BOT']

# init database
mongo = PyMongo(app)
database = Database(mongo)

# init mail service
mail = Mail(app)

# init login manager
login_manager = LoginManager(app)
login_manager.login_view = 'login'

@app.route('/')
def index():
    return redirect(url_for('ttt'))

@app.route('/ttt', methods=['GET', 'POST'], strict_slashes=False)
def ttt():
    return render_template('ttt.html')

@app.route('/ttt/play', methods=['POST'], strict_slashes=False)
def play():
    move = request.json['move'] # the player's move
    username = current_user.get_id() # the player's id

    if username == None:
        return jsonify({"status":"ERROR"})

    if move == None:
        data = { "grid": [], "winner": " " }

        if username in session:
            game = session[username]
            data['grid'] = game['grid']

        return jsonify(data)
    
    if username in session:
        game = session[username]
    else:
        total_games = database.get_user(username)['game_data']['total_games']
        game = TicTacToeGame(game_id=total_games + 1).to_dict()
    
    if game['grid'][int(move)] != " ":
        data['grid'] = game['grid']
        return jsonify(data)

    game['grid'][int(move)] = USER # set the grid with the user's move
    game['winner'] = check_winner(game['grid']) # check if the user won with this move

    if game['winner'] == " ": 
        if num_filled(game['grid']) != 9: # no one has won yet, so bot makes a move
            move = bot_move(game['grid'])

            game['grid'][move] = BOT
            game['winner'] = check_winner(game['grid']) # check if the bot won

            # update the current state of the game associated with the user
            session[username] = game

            if game['winner'] == BOT:
                # update the "game_data" field for the user with the finished game where the bot wins
                database.update_game_data(username, game)

                # remove the game from current playing games
                session.pop(username, None)
        else:
            # update the "game_data" field for the user with the finished game where there is a tie
            database.update_game_data(username, game)

            # remove the game from current playing games
            session.pop(username, None)
    
    if game['winner'] == USER:
        # update the "game_data" field for the user with the finished game where the user wins
        database.update_game_data(username, game)

        # remove the game from current playing games
        session.pop(username, None)

    data = { "grid": game['grid'], "winner": game['winner'] }
    return jsonify(data)

@app.route('/adduser', methods=['POST'], strict_slashes=False)
def add_user():
    username = request.json['username']
    password = request.json['password']
    email = request.json['email']

    verification_key = secrets.token_urlsafe(16)

    success = database.add_user(username, password, email, verification_key)
    status = "OK" if success else "ERROR"

    send_verification_email(mail, email, verification_key)
    
    return jsonify({"status": status})

@app.route('/verify', methods=['POST'], strict_slashes=False)
def verify():
    email = request.json['email']
    key = request.json['key']

    verified = database.verify_email(email, key)
    status = "OK" if verified else "ERROR"

    return jsonify({"status": status})

@app.route('/login', methods=['POST'], strict_slashes=False)
def login():
    status = "ERROR"

    username = None
    password = None

    if request.json:
        username = request.json['username']
        password = request.json['password']
    else:
        if( 'username' in request.form and request.form['username'] != '' and 
        'password' in request.form and request.form['password'] != ''):
            username = request.form['username']
            password = request.form['password']
        else:
            return jsonify({"status": status})

    user = database.get_user(username=username)

    if user and database.check_password(username=username, password=password):
        if database.can_login(username=username):
            status = "OK"
            login_user(User(user['username']))

    return jsonify({"status": status})

@app.route('/logout', methods=['POST'])
def logout():
    status = "ERROR"
    if current_user.is_authenticated:
        status = "OK"
        logout_user()

    return jsonify({"status": status})

@app.route('/listgames', methods=['POST'], strict_slashes=False)
def list_games():
    username = current_user.get_id()
    status = "ERROR"

    if not username:
        return jsonify({"status": status})

    status = "OK"
    all_games = database.mongo.db.users.find_one({"username": username})['game_data']['games']
    
    # get only certain attributes for each game.
    specific_games = [{"id": int(game['id']), "start_date": game['start_date']} for game in all_games]
    print(specific_games)

    return jsonify({
        "status": status, 
        "games": specific_games
    })

@app.route('/getgame', methods=['POST'], strict_slashes=False)
def get_game():
    username = current_user.get_id()
    status = "ERROR"

    if not username:
        return jsonify({"status": status})

    game_id = request.json['id']
    all_games = database.get_user(username)['game_data']['games']

    for game in all_games:
        if game['id'] == game_id:
            status = "OK"
            data = {
                "status": status,
                "grid": game['grid'],
                "winner": game['winner']
            }
            return jsonify(data)
    
    return jsonify({"status": status})

@app.route('/getscore', methods=['POST'], strict_slashes=False)
def get_score():
    username = current_user.get_id()
    status = "ERROR"

    if not username:
        return jsonify({"status": status})

    status = "OK"
    game_data = database.get_user(username)['game_data']

    data = {
        "status": status,
        "human": game_data['wins'],
        "wopr": game_data['losses'],
        "tie": game_data['ties']
    }

    return jsonify(data)

# keep track of user sessions
@login_manager.user_loader
def load_user(username):
    user = database.mongo.db.users.find_one({"username": username})
    return User(user['username']) if user else None

# prevent cached responses
if app.config["DEBUG"]:
    @app.after_request
    def after_request(response):
        response.headers["Cache-Control"] = "no-cache, no-store, must-revalidate, public, max-age=0"
        response.headers["Expires"] = 0
        response.headers["Pragma"] = "no-cache"
        response.headers["Access-Control-Allow-Origin"] = "*"
        return response
    






    

