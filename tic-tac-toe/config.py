# General Configuration
SECRET_KEY="<hidden>"
FLASK_ENV="production"
DEBUG=False

# Database Configuration
MONGO_HOST="<hidden>"
MONGO_PORT=27017
MONGO_DATABASE="project-2"
MONGO_COLLECTION="users"
MONGO_URI = "mongodb://" + MONGO_HOST + ":" + str(MONGO_PORT) + "/" + MONGO_DATABASE

# Mail Confirmation
MAIL_SERVER='smtp.gmail.com'
MAIL_PORT=465
MAIL_USE_SSL=True
MAIL_USE_TLS=False
MAIL_USERNAME = 'cse356.tictactoe@gmail.com'
MAIL_PASSWORD = '<hidden>'

# Game Configuration
USER="X"
BOT="O"
