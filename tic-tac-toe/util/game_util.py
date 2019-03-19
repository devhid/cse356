def check_winner(grid):
    # Check rows for a win.
    for i in range(0, len(grid), 3):
        if grid[i] != ' ' and grid[i] == grid[i + 1] and grid[i] == grid[i + 2]:
            return grid[i]

    # Check columns for a win.
    for i in range(0, 3, 1):
        if grid[i] != ' ' and grid[i] == grid[i + 3] and grid[i] == grid[i + 6]:
            return grid[i]

    # Check left-to-right diagonal for a win.
    if grid[0] == grid[4] and grid[0] == grid[8]:
        return grid[0]

    # Check right-to-left diagonal for a win.
    if grid[2] == grid[4] and grid[2] == grid[6]:
        return grid[2]

    return " "

def num_filled(grid):
    count = 0
    for i in range(len(grid)):
        if grid[i] != ' ':
            count += 1
    
    return count