# system imports
import math
import random

# internal imports
from util.game_util import num_filled
from config import USER, BOT

def bot_random(grid):
    # Bot picks a random empty slot for now.
    empty_slots = [i for i in range(len(grid)) if grid[i] == ' ']
    return empty_slots[math.floor(random.random() * len(empty_slots))]

# Better AI
def bot_move(grid):
    user_corners = user_corner_count(grid)

    if num_filled(grid) == 1:
        if len(user_corners) == 1:
            return 4
        if grid[4] == USER:
            return [0,2,6,8][math.floor(random.random() * 4)]
    
    if num_filled(grid) == 3 and len(user_corners) == 2 and grid[4] == BOT:
        if user_corners[0] in [0,2] and user_corners[1] in [0,2]:
            return 1
        if user_corners[0] in [0,6] and user_corners[1] in [0,6]:
            return 3
        if user_corners[0] in [2,8] and user_corners[1] in [2,8]:
            return 5
        if user_corners[0] in [6,8] and user_corners[1] in [6,8]:
            return 7
    
    if num_filled(grid) >= 3:
        slot = counter_row_win(grid)
        if slot != -1:
            return slot
        
        slot = counter_column_win(grid)
        if slot != -1:
            return slot
        
        slot = counter_diagonal_win(grid)
        if slot != -1:
            return slot

    return bot_random(grid)


def user_corner_count(grid):
    corners = []
    for i in range(0, len(grid), 2):
        if i != 4 and grid[i] == USER:
            corners.append(i)

    return corners

def counter_row_win(grid):
    # For row #1
    if can_win([0,1,2], grid):
        if grid[0] == grid[1]: return 2
        if grid[0] == grid[2]: return 1
        if grid[1] == grid[2]: return 0
    
    # For row #2
    if can_win([3,4,5], grid):
        if grid[3] == grid[4]: return 5
        if grid[3] == grid[5]: return 4
        if grid[4] == grid[5]: return 3

    # For row #3
    if can_win([6,7,8], grid):
        if grid[6] == grid[7]: return 8
        if grid[6] == grid[8]: return 7
        if grid[7] == grid[8]: return 6
    
    return -1

def counter_column_win(grid):
    # For column #1
    if can_win([0,3,6], grid):
        if grid[0] == grid[3]: return 6
        if grid[0] == grid[6]: return 3
        if grid[3] == grid[6]: return 0
    
    # For column #2
    if can_win([1,4,7], grid):
        if grid[1] == grid[4]: return 7
        if grid[1] == grid[7]: return 4
        if grid[4] == grid[7]: return 1

    #For column #3
    if can_win([2,5,8], grid):
        if grid[2] == grid[5]: return 8
        if grid[2] == grid[8]: return 5
        if grid[5] == grid[8]: return 2

    return -1

def counter_diagonal_win(grid):
    # For diagonal #1
    if can_win([0,4,8], grid):
        if grid[0] == grid[4]: return 8
        if grid[0] == grid[8]: return 4
        if grid[4] == grid[8]: return 0
    
    # For diagonal #2
    if can_win([2,4,6], grid):
        if grid[2] == grid[4]: return 6
        if grid[2] == grid[6]: return 4
        if grid[4] == grid[6]: return 2 

    return -1   

def can_win(trio, grid):
    count = 0
    for i in trio:
        if grid[i] == USER:
            count += 1
        elif grid[i] == BOT:
            count -= 1
        else:
            continue
    
    return count == 2
