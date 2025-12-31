def solve(data: list[str]) -> int:
    """
    Find the largest rectangle with red corners where all tiles are red or green.
    Red tiles form a polygon loop. Green tiles are on the edges between consecutive
    red tiles and all tiles inside the polygon.
    """

    red_tiles = [tuple(map(int, line.split(','))) for line in data]

    # Step 1: Compress 2D coordinates 🤯
    xs = sorted(set(x for x, y in red_tiles))
    ys = sorted(set(y for x, y in red_tiles))

    x_map = {x: i for i, x in enumerate(xs)}
    y_map = {y: i for i, y in enumerate(ys)}

    # Compressed red tiles
    compressed_red = [(x_map[x], y_map[y]) for x, y in red_tiles]

    # Create grid
    width = len(xs)
    height = len(ys)
    grid = [['.' for _ in range(width)] for _ in range(height)]

    # Mark red tiles
    for cx, cy in compressed_red:
        grid[cy][cx] = '#'

    # Step 2: Rasterize polygon edges
    for i in range(len(compressed_red)):
        cx1, cy1 = compressed_red[i]
        cx2, cy2 = compressed_red[(i + 1) % len(compressed_red)]

        if cx1 == cx2:  # vertical line
            for cy in range(min(cy1, cy2), max(cy1, cy2) + 1):
                grid[cy][cx1] = '#'
        elif cy1 == cy2:  # horizontal line
            for cx in range(min(cx1, cx2), max(cx1, cx2) + 1):
                grid[cy1][cx] = '#'

    # Step 3: Find an inside point using raycast
    inside_point = None
    for cy in range(height):
        for cx in range(width):
            if grid[cy][cx] != '.':
                continue

            # Count transitions from this point to the left
            transitions = 0
            prev = '.'
            for i in range(cx, -1, -1):
                cur = grid[cy][i]
                if cur != prev:
                    transitions += 1
                prev = cur

            # Odd transitions means inside
            if transitions % 2 == 1:
                inside_point = (cx, cy)
                break
        if inside_point:
            break

    # Step 4: Flood fill from the inside point
    if inside_point:
        stack = [inside_point]
        while stack:
            cx, cy = stack.pop()
            if 0 <= cx < width and 0 <= cy < height and grid[cy][cx] == '.':
                grid[cy][cx] = 'X'
                stack.extend([(cx + 1, cy), (cx - 1, cy), (cx, cy + 1), (cx, cy - 1)])

    # Step 5: Find the largest rectangle with red corners where the perimeter is inside polygon
    largest_area = 0

    for i, (x1, y1) in enumerate(red_tiles):
        cx1, cy1 = x_map[x1], y_map[y1]

        for x2, y2 in red_tiles[i + 1:]:
            cx2, cy2 = x_map[x2], y_map[y2]

            # Calculate actual area (not compressed area)
            actual_width = abs(x2 - x1) + 1
            actual_height = abs(y2 - y1) + 1
            area = actual_width * actual_height

            # Skip if this rectangle can't beat current best
            if area <= largest_area:
                continue

            # Check if the perimeter is enclosed (not outside)
            min_cx = min(cx1, cx2)
            max_cx = max(cx1, cx2)
            min_cy = min(cy1, cy2)
            max_cy = max(cy1, cy2)

            enclosed = True

            # Check top and bottom edges
            for cx in range(min_cx, max_cx + 1):
                if grid[min_cy][cx] == '.' or grid[max_cy][cx] == '.':
                    enclosed = False
                    break

            # Check left and right edges
            if enclosed:
                for cy in range(min_cy, max_cy + 1):
                    if grid[cy][min_cx] == '.' or grid[cy][max_cx] == '.':
                        enclosed = False
                        break

            if enclosed:
                largest_area = area

    return largest_area

if __name__ == '__main__':
    with open('9.txt', 'r') as f:
        data = f.read().strip().split('\n')
    
    result = solve(data)
    print(result)
